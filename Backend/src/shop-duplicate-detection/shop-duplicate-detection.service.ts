import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShopDuplicateLog } from './shop-duplicate-log.entity';
import { Shop } from '../shop/shop.entity';

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
    lat: number,
    lon: number,
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

    // 2. Location Proximity
    if (lat !== undefined && lon !== undefined) {
      const point = `POINT(${lon} ${lat})`;
      const locationMatches = await this.shopRepo
        .createQueryBuilder('shop')
        .where('ST_DWithin(shop.location, ST_GeogFromText(:point), 50)')
        .setParameters({ point })
        .getMany();

      for (const match of locationMatches) {
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
}
