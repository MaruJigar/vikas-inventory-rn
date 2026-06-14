import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Manufacturer } from './manufacturer.entity';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { Distributor } from '../distributor/distributor.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { User } from '../user/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { CreateManufacturerAdminDto } from './dto/create-manufacturer-admin.dto';
import { UpdateManufacturerAdminDto } from './dto/update-manufacturer-admin.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer) private manufacturerRepo: Repository<Manufacturer>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
  ) {}

  async createProfile(userId: string, dto: CreateManufacturerDto) {
    const existing = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
    if (existing) throw new BadRequestException('Manufacturer profile already exists');

    const profile = this.manufacturerRepo.create({
      user_id: userId,
      ...dto,
    });
    return this.manufacturerRepo.save(profile);
  }

  async getProfile(userId: string) {
    const profile = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
    if (!profile) throw new NotFoundException('Manufacturer profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateManufacturerDto) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.manufacturerRepo.save(profile);
  }

  async getManufacturers(queryDto: ListQueryDto): Promise<PaginatedResponse<Manufacturer>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder = 'DESC' } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.manufacturerRepo.createQueryBuilder('manufacturer');

    if (search) {
      qb.andWhere('(manufacturer.company_name ILIKE :search OR manufacturer.contact_person ILIKE :search)', { search: `%${search}%` });
    }

    const allowedSortFields = ['created_at', 'updated_at', 'company_name'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`manufacturer.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('manufacturer.created_at', 'DESC');
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

  async getManufacturerById(id: string) {
    const manufacturer = await this.manufacturerRepo.findOne({ where: { id } });
    if (!manufacturer) throw new NotFoundException('Manufacturer not found');
    return manufacturer;
  }

  async createManufacturerAdmin(actorUserId: string, dto: CreateManufacturerAdminDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const existing = await queryRunner.manager.findOne(User, { where: [{ email: dto.email }, { phone: dto.phone }] });
      if (existing) throw new BadRequestException('User with email or phone already exists');

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = queryRunner.manager.create(User, {
        full_name: dto.contact_person || dto.company_name,
        email: dto.email,
        phone: dto.phone,
        password_hash: hashedPassword,
        role: 'MANUFACTURER_ADMIN',
        approval_status: 'APPROVED',
      });
      await queryRunner.manager.save(user);

      // Create profile
      const manufacturer = queryRunner.manager.create(Manufacturer, {
        user_id: user.id,
        company_name: dto.company_name,
        contact_person: dto.contact_person,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        is_active: true,
      });
      await queryRunner.manager.save(manufacturer);

      await queryRunner.commitTransaction();

      await this.auditLogService.logAction(
        'MANUFACTURER_CREATED',
        'MANUFACTURER',
        manufacturer.id,
        actorUserId,
        { new_values: manufacturer }
      );

      return { user, profile: manufacturer };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateManufacturerAdmin(actorUserId: string, id: string, dto: UpdateManufacturerAdminDto) {
    const manufacturer = await this.getManufacturerById(id);
    const oldValues = { ...manufacturer };
    Object.assign(manufacturer, dto);
    const updated = await this.manufacturerRepo.save(manufacturer);

    await this.auditLogService.logAction(
      'MANUFACTURER_UPDATED',
      'MANUFACTURER',
      updated.id,
      actorUserId,
      { old_values: oldValues, new_values: updated }
    );

    return updated;
  }

  async linkDistributor(manufacturerId: string, distributorId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manufacturer = await queryRunner.manager.findOne(Manufacturer, { where: { id: manufacturerId } });
      const distributor = await queryRunner.manager.findOne(Distributor, { where: { id: distributorId } });
      
      if (!manufacturer || !distributor) throw new NotFoundException('Manufacturer or Distributor not found');

      const link = queryRunner.manager.create(ManufacturerDistributor, {
        manufacturer_id: manufacturerId,
        distributor_id: distributorId,
      });

      await queryRunner.manager.save(link);
      await queryRunner.commitTransaction();
      return link;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
