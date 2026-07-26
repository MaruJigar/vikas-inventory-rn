import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkingDay } from './working-day.entity';
import { LocationLog } from '../location/location-log.entity';
import { LatestLocation } from '../location/latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';

import { WorkingDayQueryDto } from './dto/working-day-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class WorkingDayService {
  constructor(
    @InjectRepository(WorkingDay) private wdRepo: Repository<WorkingDay>,
    @InjectRepository(LocationLog) private locLogRepo: Repository<LocationLog>,
    @InjectRepository(LatestLocation)
    private latestLocRepo: Repository<LatestLocation>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway,
  ) {}

  async checkIn(userId: string, dto: CheckInDto) {
    if (dto.idempotency_key) {
      const existing = await this.wdRepo.findOne({
        where: { idempotency_key: dto.idempotency_key },
      });
      if (existing) return existing;
    }

    const salesman = await this.salesmanRepo.findOne({
      where: { user_id: userId },
    });
    if (!salesman) throw new ForbiddenException('Only salesmen can check in');
    if (salesman.approval_status !== 'APPROVED')
      throw new ForbiddenException('Salesman is not approved');

    const distributor = await this.distRepo.findOne({
      where: { id: salesman.distributor_id },
    });
    if (
      !distributor ||
      distributor.approval_status !== 'APPROVED' ||
      !distributor.is_active
    ) {
      throw new ForbiddenException('Distributor is not active');
    }

    const point = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedWd: WorkingDay;

    try {
      const now = new Date();

      // Auto-close any previous active working day as MISSED
      const previousActiveWd = await queryRunner.manager.findOne(WorkingDay, {
        where: { salesman_id: salesman.id, status: 'ACTIVE' },
        lock: { mode: 'pessimistic_write' },
      });

      if (previousActiveWd) {
        previousActiveWd.status = 'MISSED';
        await queryRunner.manager.save(previousActiveWd);
      }

      const wd = queryRunner.manager.create(WorkingDay, {
        salesman_id: salesman.id,
        distributor_id: salesman.distributor_id,
        check_in_at: now,
        check_in_location: point,
        status: 'ACTIVE',
        device_id: dto.device_id,
        idempotency_key: dto.idempotency_key,
      });
      savedWd = await queryRunner.manager.save(wd);

      const locLog = queryRunner.manager.create(LocationLog, {
        salesman_id: salesman.id,
        distributor_id: salesman.distributor_id,
        working_day_id: savedWd.id,
        event_type: 'CHECK_IN',
        location: point,
        captured_at: now,
        device_id: dto.device_id,
      });
      await queryRunner.manager.save(locLog);

      let latest = await queryRunner.manager.findOne(LatestLocation, {
        where: { salesman_id: salesman.id },
      });
      if (!latest) {
        latest = queryRunner.manager.create(LatestLocation, {
          salesman_id: salesman.id,
        });
      }
      latest.distributor_id = salesman.distributor_id;
      latest.working_day_id = savedWd.id;
      latest.location = point;
      latest.is_tracking_active = true;
      latest.last_updated_at = now;
      await queryRunner.manager.save(latest);

      await this.auditLogService.logAction(
        'CHECK_IN',
        'WORKING_DAY',
        savedWd.id,
        userId,
        {
          location: point,
          device_id: dto.device_id,
        },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new ConflictException(
          'Salesman already has an active working day or idempotency conflict.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }

    this.socketGateway.broadcastToRoom(
      `DISTRIBUTOR_ADMIN:${distributor.user_id}`,
      'SALESMAN_CHECKED_IN',
      {
        salesmanId: salesman.id,
        workingDayId: savedWd.id,
        timestamp: savedWd.check_in_at,
      },
    );

    return savedWd;
  }

  async checkOut(userId: string, dto: CheckOutDto) {
    if (dto.idempotency_key) {
      const existing = await this.wdRepo.findOne({
        where: { idempotency_key: dto.idempotency_key },
      });
      if (existing) return existing;
    }

    const salesman = await this.salesmanRepo.findOne({
      where: { user_id: userId },
    });
    if (!salesman) throw new ForbiddenException('Only salesmen can check out');
    if (salesman.approval_status !== 'APPROVED')
      throw new ForbiddenException('Salesman is not approved');

    const point = {
      type: 'Point',
      coordinates: [dto.longitude, dto.latitude],
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedWd: WorkingDay;

    try {
      const activeWd = await queryRunner.manager.findOne(WorkingDay, {
        where: { salesman_id: salesman.id, status: 'ACTIVE' },
        lock: { mode: 'pessimistic_write' },
      });
      if (!activeWd)
        throw new BadRequestException(
          'No active working day found to check out.',
        );

      const now = new Date();

      activeWd.check_out_at = now;
      activeWd.check_out_location = point;
      activeWd.status = 'COMPLETED';
      if (dto.device_id) activeWd.device_id = dto.device_id;
      if (dto.idempotency_key) activeWd.idempotency_key = dto.idempotency_key;

      savedWd = await queryRunner.manager.save(activeWd);

      const locLog = queryRunner.manager.create(LocationLog, {
        salesman_id: salesman.id,
        distributor_id: salesman.distributor_id,
        working_day_id: savedWd.id,
        event_type: 'CHECK_OUT',
        location: point,
        captured_at: now,
        device_id: dto.device_id,
      });
      await queryRunner.manager.save(locLog);

      const latest = await queryRunner.manager.findOne(LatestLocation, {
        where: { salesman_id: salesman.id },
      });
      if (latest) {
        latest.location = point;
        latest.is_tracking_active = false;
        latest.last_updated_at = now;
        await queryRunner.manager.save(latest);
      }

      await this.auditLogService.logAction(
        'CHECK_OUT',
        'WORKING_DAY',
        savedWd.id,
        userId,
        {
          location: point,
          device_id: dto.device_id,
        },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.code === '23505') {
        throw new ConflictException('Idempotency conflict.');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }

    const distributor = await this.distRepo.findOne({
      where: { id: salesman.distributor_id },
    });
    if (distributor) {
      this.socketGateway.broadcastToRoom(
        `DISTRIBUTOR_ADMIN:${distributor.user_id}`,
        'SALESMAN_CHECKED_OUT',
        {
          salesmanId: salesman.id,
          workingDayId: savedWd.id,
          timestamp: savedWd.check_out_at,
        },
      );
    }

    return savedWd;
  }

  async getHistory(
    userId: string,
    userRole: string,
    query: WorkingDayQueryDto,
  ): Promise<PaginatedResponse<WorkingDay>> {
    const { page = 1, limit = 20, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const qb = this.wdRepo
      .createQueryBuilder('wd')
      .leftJoinAndSelect('wd.salesman', 'salesman')
      .leftJoinAndSelect('wd.distributor', 'distributor');

    if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman) return { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      qb.andWhere('wd.salesman_id = :salesmanId', { salesmanId: salesman.id });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) return { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      qb.andWhere('wd.distributor_id = :distId', { distId: dist.id });
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfr = await this.dataSource.getRepository('Manufacturer').findOne({ where: { user_id: userId } });
      if (!mfr) return { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      
      const internalDistributors = await this.distRepo.find({
        where: { is_internal_distributor: true }
      });
      const distIds = internalDistributors.map(d => d.id);
      
      if (distIds.length === 0) {
        return { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
      }
      qb.andWhere('wd.distributor_id IN (:...distIds)', { distIds });
    } else if (userRole === 'SUPER_ADMIN') {
      // Sees all
    } else {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
    }

    if (search) {
      qb.andWhere('salesman.full_name ILIKE :search', { search: `%${search}%` });
    }

    if (startDate) {
      qb.andWhere('wd.check_in_at >= :startDate', { startDate: new Date(startDate) });
    }

    if (endDate) {
      // To include the end date fully, you might want to add 1 day or rely on the caller to send proper time.
      qb.andWhere('wd.check_in_at <= :endDate', { endDate: new Date(endDate) });
    }

    qb.orderBy('wd.check_in_at', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
