import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Distributor } from './distributor.entity';
import { ManufacturerDistributor } from './manufacturer-distributor.entity';
import { User } from '../user/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpdateDistributorProfileDto } from './dto/update-distributor-profile.dto';
import { CreateDistributorAdminDto } from './dto/create-distributor-admin.dto';
import { UpdateDistributorAdminDto } from './dto/update-distributor-admin.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class DistributorService {
  constructor(
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(ManufacturerDistributor)
    private manufacturerDistributorRepo: Repository<ManufacturerDistributor>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.distributorRepo.findOne({
      where: { user_id: userId },
    });
    if (!profile) throw new NotFoundException('Distributor profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateDistributorProfileDto) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.distributorRepo.save(profile);
  }

  async getDistributors(
    actorUserId: string,
    role: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<Distributor>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.distributorRepo.createQueryBuilder('distributor');

    if (role === 'MANUFACTURER_ADMIN') {
      const manufacturerResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [actorUserId],
      );
      if (!manufacturerResult.length)
        throw new ForbiddenException('Manufacturer profile not found');
      const manufacturerId = manufacturerResult[0].id;

      qb.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = distributor.id AND md.manufacturer_id = :manufacturerId',
        { manufacturerId },
      );
    } else if (role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Unauthorized role');
    }

    if (search) {
      qb.andWhere(
        '(distributor.business_name ILIKE :search OR distributor.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (queryDto.status) {
      if (queryDto.status === 'active') {
        qb.andWhere('distributor.is_active = :isActive', { isActive: true });
      } else if (queryDto.status === 'inactive') {
        qb.andWhere('distributor.is_active = :isActive', { isActive: false });
      }
    }

    const allowedSortFields = ['created_at', 'updated_at', 'business_name'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`distributor.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('distributor.created_at', 'DESC');
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

  async getDistributorById(actorUserId: string, role: string, id: string) {
    const qb = this.distributorRepo
      .createQueryBuilder('distributor')
      .where('distributor.id = :id', { id });

    if (role === 'MANUFACTURER_ADMIN') {
      const manufacturerResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [actorUserId],
      );
      if (!manufacturerResult.length)
        throw new ForbiddenException('Manufacturer profile not found');
      const manufacturerId = manufacturerResult[0].id;

      qb.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = distributor.id AND md.manufacturer_id = :manufacturerId',
        { manufacturerId },
      );
    } else if (role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Unauthorized role');
    }

    const distributor = await qb.getOne();
    if (!distributor) {
      if (role === 'MANUFACTURER_ADMIN')
        throw new ForbiddenException('Unauthorized or Distributor not found');
      throw new NotFoundException('Distributor not found');
    }

    const links = await this.manufacturerDistributorRepo.find({
      where: { distributor_id: id },
    });
    
    return {
      ...distributor,
      manufacturer_ids: links.map(link => link.manufacturer_id),
    };
  }

  async createDistributorAdmin(
    actorUserId: string,
    role: string,
    dto: CreateDistributorAdminDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exists = await queryRunner.manager.findOne(User, {
        where: [{ email: dto.email }, { phone: dto.phone }],
      });
      if (exists)
        throw new BadRequestException(
          'User with email or phone already exists',
        );

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = queryRunner.manager.create(User, {
        full_name: dto.contact_person || dto.business_name,
        email: dto.email,
        phone: dto.phone,
        password_hash: hashedPassword,
        role: 'DISTRIBUTOR_ADMIN',
        approval_status: 'APPROVED',
      });
      await queryRunner.manager.save(user);

      const distributor = queryRunner.manager.create(Distributor, {
        user_id: user.id,
        business_name: dto.business_name,
        owner_name: dto.contact_person,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        approval_status: 'APPROVED',
        is_active: true,
      });
      await queryRunner.manager.save(distributor);

      // Resolve Linkage
      let manufacturerIds: string[] = [];
      if (role === 'MANUFACTURER_ADMIN') {
        const mfr = await queryRunner.manager.findOne('Manufacturer', {
          where: { user_id: actorUserId },
        });
        if (mfr) manufacturerIds = [(mfr as any).id];
      } else if (role === 'SUPER_ADMIN' && dto.manufacturer_ids && dto.manufacturer_ids.length > 0) {
        manufacturerIds = dto.manufacturer_ids;
      }

      for (const mfrId of manufacturerIds) {
        const link = queryRunner.manager.create(ManufacturerDistributor, {
          manufacturer_id: mfrId,
          distributor_id: distributor.id,
          status: 'APPROVED',
        });
        await queryRunner.manager.save(link);
      }

      await queryRunner.commitTransaction();

      await this.auditLogService.logAction(
        'DISTRIBUTOR_CREATED',
        'DISTRIBUTOR',
        distributor.id,
        actorUserId,
        { new_values: distributor },
      );

      const {
        password_hash,
        hashed_refresh_token,
        reset_password_token_hash,
        reset_password_expires_at,
        ...safeUser
      } = user;

      return { user: safeUser, profile: distributor };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateDistributorAdmin(
    actorUserId: string,
    role: string,
    id: string,
    dto: UpdateDistributorAdminDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // We can use the existing getDistributorById for validation, but we need it inside the transaction scope ideally
      // or we just fetch it, verify ownership, then do transaction
      const distributor = await this.getDistributorById(actorUserId, role, id);
      const oldValues = { ...distributor };
      
      const { manufacturer_ids, ...updateData } = dto;
      Object.assign(distributor, updateData);
      const updated = await queryRunner.manager.save(distributor);

      if (role === 'SUPER_ADMIN' && manufacturer_ids) {
        await queryRunner.manager.delete(ManufacturerDistributor, { distributor_id: id });
        for (const mfrId of manufacturer_ids) {
          const link = queryRunner.manager.create(ManufacturerDistributor, {
            manufacturer_id: mfrId,
            distributor_id: id,
            status: 'APPROVED',
          });
          await queryRunner.manager.save(link);
        }
      }

      if (distributor.user_id) {
        const user = await queryRunner.manager.findOne(User, {
          where: { id: distributor.user_id },
        });
        if (user) {
          if (dto.email !== undefined) user.email = dto.email;
          if (dto.phone !== undefined) user.phone = dto.phone;
          // Note: The entity uses owner_name but the user requested contact_person logic, we will check both or just owner_name
          if (dto.owner_name !== undefined || dto.business_name !== undefined) {
            user.full_name =
              dto.owner_name || dto.business_name || user.full_name;
          }
          if (typeof dto.is_active === 'boolean') {
            user.is_active = dto.is_active;
          }
          await queryRunner.manager.save(user);
        }
      }

      await queryRunner.commitTransaction();

      await this.auditLogService.logAction(
        'DISTRIBUTOR_UPDATED',
        'DISTRIBUTOR',
        updated.id,
        actorUserId,
        { old_values: oldValues, new_values: updated },
      );

      return updated;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteDistributorAdmin(actorUserId: string, role: string, id: string) {
    const distributor = await this.getDistributorById(actorUserId, role, id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(Distributor, { id });

      if (distributor.user_id) {
        await queryRunner.manager.softDelete(User, { id: distributor.user_id });
      }

      await queryRunner.commitTransaction();

      await this.auditLogService.logAction(
        'DISTRIBUTOR_DELETED',
        'DISTRIBUTOR',
        id,
        actorUserId,
        { old_values: distributor },
      );

      return { message: 'Distributor deleted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
