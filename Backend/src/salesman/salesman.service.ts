import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Salesman } from './salesman.entity';
import { User } from '../user/user.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { CreateSalesmanAdminDto } from './dto/create-salesman-admin.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
import { UpdateSalesmanStatusDto } from './dto/update-salesman-status.dto';
import * as bcrypt from 'bcrypt';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class SalesmanService {
  constructor(
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(ApprovalRequest)
    private approvalRepo: Repository<ApprovalRequest>,
    private dataSource: DataSource,
  ) {}

  async register(dto: RegisterSalesmanDto) {
    const existingUser = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    if (existingUser) {
      throw new BadRequestException(
        'User with this phone number already exists',
      );
    }

    const distributor = await this.distributorRepo.findOne({
      where: { id: dto.distributor_id },
    });
    if (!distributor) {
      throw new BadRequestException('Invalid distributor ID');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const password_hash = await bcrypt.hash(dto.password, 10);

      const user = queryRunner.manager.create(User, {
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        password_hash,
        role: 'SALESMAN',
        approval_status: 'PENDING_APPROVAL',
        is_active: true,
      });
      const savedUser = await queryRunner.manager.save(user);

      const salesman = queryRunner.manager.create(Salesman, {
        user_id: savedUser.id,
        distributor_id: distributor.id,
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        approval_status: 'PENDING_APPROVAL',
        is_active: false,
      });
      const savedSalesman = await queryRunner.manager.save(salesman);

      const approval = queryRunner.manager.create(ApprovalRequest, {
        request_type: 'SALESMAN_APPROVAL',
        requester_user_id: savedUser.id,
        distributor_id: distributor.id,
        salesman_id: savedSalesman.id,
        status: 'PENDING_APPROVAL',
      });
      await queryRunner.manager.save(approval);

      await queryRunner.commitTransaction();

      const { password_hash: _, ...userWithoutPassword } = savedUser;
      return { user: userWithoutPassword, salesman: savedSalesman };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createSalesmanAdmin(
    dto: CreateSalesmanAdminDto,
    userRole: string,
    userId: string,
  ) {
    const existingUser = await this.userRepo.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });
    if (existingUser) {
      throw new BadRequestException(
        'User with this email or phone already exists',
      );
    }

    let targetDistributorId = dto.distributor_id;

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distributorRepo.findOne({
        where: { user_id: userId },
      });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      targetDistributorId = dist.id;
    } else {
      if (!targetDistributorId) {
        throw new BadRequestException('distributor_id is required');
      }

      if (userRole === 'MANUFACTURER_ADMIN') {
        const mfrResult = await this.dataSource.query(
          `SELECT id FROM manufacturers WHERE user_id = $1`,
          [userId],
        );
        if (!mfrResult.length)
          throw new ForbiddenException('Manufacturer profile not found');

        const link = await this.dataSource.query(
          `SELECT id FROM manufacturer_distributors WHERE manufacturer_id = $1 AND distributor_id = $2`,
          [mfrResult[0].id, targetDistributorId],
        );
        if (!link.length) {
          throw new ForbiddenException(
            'Distributor not linked to your manufacturer network',
          );
        }
      } else if (userRole !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Unauthorized role');
      }
    }

    const distributor = await this.distributorRepo.findOne({
      where: { id: targetDistributorId },
    });
    if (!distributor) {
      throw new BadRequestException('Invalid distributor ID');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const password_hash = await bcrypt.hash(dto.password, 10);

      const user = queryRunner.manager.create(User, {
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        password_hash,
        role: 'SALESMAN',
        approval_status: 'APPROVED',
        is_active: true,
      });
      const savedUser = await queryRunner.manager.save(user);

      const salesman = queryRunner.manager.create(Salesman, {
        user_id: savedUser.id,
        distributor_id: distributor.id,
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        approval_status: 'APPROVED',
        is_active: true,
        state_id: dto.state_id,
        state_name: dto.state,
        city_id: dto.city_id,
        city_name: dto.city,
      });
      const savedSalesman = await queryRunner.manager.save(salesman);

      await queryRunner.commitTransaction();

      const {
        password_hash: _,
        hashed_refresh_token,
        reset_password_token_hash,
        reset_password_expires_at,
        ...userWithoutPassword
      } = savedUser;

      return { user: userWithoutPassword, salesman: savedSalesman };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getSalesmen(
    userRole: string,
    userId: string,
    queryDto: ListQueryDto = {} as any,
  ): Promise<PaginatedResponse<Salesman>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.salesmanRepo
      .createQueryBuilder('salesman')
      .leftJoinAndSelect('salesman.distributor', 'distributor');

    if (userRole === 'SUPER_ADMIN') {
      // Global
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length)
        throw new ForbiddenException('Manufacturer profile not found');

      qb.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = salesman.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distributorRepo.findOne({
        where: { user_id: userId },
      });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      qb.andWhere('salesman.distributor_id = :distId', { distId: dist.id });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    if (search) {
      qb.andWhere(
        '(salesman.full_name ILIKE :search OR salesman.phone ILIKE :search OR salesman.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('salesman.approval_status = :status', { status });
    }

    if (startDate)
      qb.andWhere('salesman.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('salesman.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = ['created_at', 'updated_at', 'full_name'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`salesman.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('salesman.created_at', 'DESC');
    }

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

  async getSalesmanById(id: string, userRole: string, userId: string) {
    const qb = this.salesmanRepo
      .createQueryBuilder('salesman')
      .leftJoinAndSelect('salesman.distributor', 'distributor')
      .where('salesman.id = :id', { id });

    if (userRole === 'SUPER_ADMIN') {
      // Global
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length)
        throw new ForbiddenException('Manufacturer profile not found');

      qb.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = salesman.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distributorRepo.findOne({
        where: { user_id: userId },
      });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      qb.andWhere('salesman.distributor_id = :distId', { distId: dist.id });
    } else if (userRole === 'SALESMAN') {
      qb.andWhere('salesman.user_id = :userId', { userId });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    const salesman = await qb.getOne();
    if (!salesman)
      throw new NotFoundException('Salesman not found or unauthorized');

    return salesman;
  }

  async updateSalesman(
    id: string,
    dto: UpdateSalesmanDto,
    userRole: string,
    userId: string,
  ) {
    const salesman = await this.getSalesmanById(id, userRole, userId);

    Object.assign(salesman, dto);

    // Explicitly map DTO state/city properties to the entity's state_name/city_name
    if (dto.state !== undefined) {
      salesman.state_name = dto.state; // Cast in case dto.state is passed but entity expects state_name
      delete (salesman as any).state;
    }
    if (dto.city !== undefined) {
      salesman.city_name = dto.city;
      delete (salesman as any).city;
    }

    // Remove relation objects so TypeORM doesn't overwrite our updated foreign keys
    delete salesman.city;
    delete salesman.state;

    await this.salesmanRepo.save(salesman);

    if (dto.full_name || dto.phone || dto.email) {
      const user = await this.userRepo.findOne({
        where: { id: salesman.user_id },
      });
      if (user) {
        if (dto.full_name) user.full_name = dto.full_name;
        if (dto.phone) user.phone = dto.phone;
        if (dto.email) user.email = dto.email;
        await this.userRepo.save(user);
      }
    }

    return this.getSalesmanById(id, userRole, userId);
  }

  async updateSalesmanStatus(
    id: string,
    dto: UpdateSalesmanStatusDto,
    userRole: string,
    userId: string,
  ) {
    const salesman = await this.getSalesmanById(id, userRole, userId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      salesman.is_active = dto.is_active;
      await queryRunner.manager.save(Salesman, salesman);

      const user = await queryRunner.manager.findOne(User, {
        where: { id: salesman.user_id },
      });
      if (user) {
        user.is_active = dto.is_active;
        await queryRunner.manager.save(User, user);
      }

      await queryRunner.commitTransaction();
      return { message: 'Salesman status updated successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
