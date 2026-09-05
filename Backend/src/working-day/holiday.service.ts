import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './holiday.entity';
import { Distributor } from '../distributor/distributor.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday) private holidayRepo: Repository<Holiday>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
  ) {}

  async create(userId: string, role: string, distributorId: string, dto: CreateHolidayDto) {
    await this.validateAccess(userId, role, distributorId);

    const existing = await this.holidayRepo.findOne({
      where: { distributor_id: distributorId, holiday_date: dto.holiday_date },
    });
    if (existing) {
      throw new ConflictException(`Holiday already exists on ${dto.holiday_date}`);
    }

    const holiday = this.holidayRepo.create({
      distributor_id: distributorId,
      holiday_date: dto.holiday_date,
      name: dto.name,
    });
    return this.holidayRepo.save(holiday);
  }

  async findAll(userId: string, role: string, distributorId: string, query: ListQueryDto) {
    await this.validateAccess(userId, role, distributorId);

    const { page = 1, limit = 20, search, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const qb = this.holidayRepo.createQueryBuilder('holiday')
      .where('holiday.distributor_id = :distributorId', { distributorId });

    if (search) {
      qb.andWhere('holiday.name ILIKE :search', { search: `%${search}%` });
    }

    if (startDate) {
      qb.andWhere('holiday.holiday_date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('holiday.holiday_date <= :endDate', { endDate });
    }

    qb.orderBy('holiday.holiday_date', 'DESC');

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

  async findOne(userId: string, role: string, id: string) {
    const holiday = await this.holidayRepo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundException('Holiday not found');

    await this.validateAccess(userId, role, holiday.distributor_id);
    return holiday;
  }

  async update(userId: string, role: string, id: string, dto: UpdateHolidayDto) {
    const holiday = await this.findOne(userId, role, id);

    if (dto.holiday_date && dto.holiday_date !== holiday.holiday_date) {
      const existing = await this.holidayRepo.findOne({
        where: { distributor_id: holiday.distributor_id, holiday_date: dto.holiday_date },
      });
      if (existing) {
        throw new ConflictException(`Holiday already exists on ${dto.holiday_date}`);
      }
    }

    Object.assign(holiday, dto);
    return this.holidayRepo.save(holiday);
  }

  async remove(userId: string, role: string, id: string) {
    const holiday = await this.findOne(userId, role, id);
    await this.holidayRepo.remove(holiday);
    return { success: true };
  }

  private async validateAccess(userId: string, role: string, targetDistributorId: string) {
    if (role === 'SUPER_ADMIN') {
      return; // Can access any
    }
    if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist || dist.id !== targetDistributorId) {
        throw new ForbiddenException('You can only manage your own distributor settings');
      }
      return;
    }
    throw new ForbiddenException('Unauthorized');
  }
}
