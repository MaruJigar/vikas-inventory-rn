import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShopDuplicateLog } from './shop-duplicate-log.entity';
import { Shop } from '../shop/shop.entity';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Injectable()
export class ShopDuplicateDetectionService {
  constructor(
    @InjectRepository(ShopDuplicateLog)
    private logRepo: Repository<ShopDuplicateLog>,
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    private dataSource: DataSource,
  ) {}

  async checkDuplicate(
    distributorId: string,
    phone: string,
    name: string,
    cityId?: string,
    stateId?: string,
  ) {
    const matches: any[] = [];

    // 1. Phone Match
    const phoneMatches = await this.shopRepo.find({ where: { phone } });
    for (const match of phoneMatches) {
      matches.push({
        shop: match,
        match_type: 'PHONE',
        match_score: 100,
      });
    }

    // 2. City Proximity
    if (cityId) {
      const cityMatches = await this.shopRepo
        .createQueryBuilder('shop')
        .where('shop.city_id = :cityId', { cityId })
        .andWhere('shop.name ILIKE :name', { name: `%${name}%` })
        .getMany();

      for (const match of cityMatches) {
        if (!matches.find((m) => m.shop.id === match.id)) {
          matches.push({
            shop: match,
            match_type: 'LOCATION',
            match_score: 80,
          });
        }
      }
    }

    // 3. Name fuzzy match
    const nameMatches = await this.shopRepo
      .createQueryBuilder('shop')
      .where('shop.name ILIKE :name', { name: `%${name}%` })
      .getMany();

    for (const match of nameMatches) {
      if (!matches.find((m) => m.shop.id === match.id)) {
        matches.push({
          shop: match,
          match_type: 'NAME',
          match_score: 60,
        });
      }
    }

    return matches;
  }

  async createLog(queryRunner: any, data: Partial<ShopDuplicateLog>) {
    const log = queryRunner.manager.create(ShopDuplicateLog, data);
    return queryRunner.manager.save(log);
  }

  async getDuplicateAudit(queryDto: ListQueryDto = {} as any) {
    const { page = 1, limit = 20, search, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.logRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.distributor', 'distributor')
      .leftJoinAndSelect('log.matched_shop', 'matched_shop')
      .leftJoinAndSelect('log.created_by_user', 'created_by_user')
      .leftJoinAndSelect('log.attempted_city', 'attempted_city')
      .leftJoinAndSelect('log.attempted_state', 'attempted_state');

    if (startDate) qb.andWhere('log.created_at >= :startDate', { startDate });
    if (endDate) qb.andWhere('log.created_at <= :endDate', { endDate });
    if (search) {
      qb.andWhere(
        '(log.attempted_shop_name ILIKE :search OR log.attempted_phone ILIKE :search OR log.match_type ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('log.created_at', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
