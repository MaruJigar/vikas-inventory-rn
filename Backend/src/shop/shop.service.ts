import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shop } from './shop.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopDuplicateDetectionService } from '../shop-duplicate-detection/shop-duplicate-detection.service';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    private duplicateDetectionService: ShopDuplicateDetectionService,
    private dataSource: DataSource
  ) {}

  async createShop(dto: CreateShopDto, userId: string, userRole: string) {
    let distributorId: string;
    let salesmanId: string | undefined = undefined;

    if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!salesman) throw new ForbiddenException('Salesman profile not found');
      distributorId = salesman.distributor_id;
      salesmanId = salesman.id;
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      distributorId = dist.id;
    } else {
      throw new ForbiddenException('Only distributors and salesmen can create shops');
    }

    if (!dto.verification_photo_url) {
      throw new BadRequestException('Shop verification photo is mandatory');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const point = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };

      const shop = queryRunner.manager.create(Shop, {
        distributor_id: distributorId,
        created_by_user_id: userId,
        created_by_salesman_id: salesmanId,
        name: dto.name,
        owner_name: dto.owner_name,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        gst_number: dto.gst_number,
        location: point,
        verification_photo_url: dto.verification_photo_url,
        verification_status: 'VERIFIED',
      });

      const savedShop = await queryRunner.manager.save(shop);

      if (dto.duplicate_bypass) {
        await this.duplicateDetectionService.createLog(queryRunner, {
          distributor_id: distributorId,
          attempted_shop_name: dto.name,
          attempted_phone: dto.phone,
          attempted_location: point,
          matched_shop_id: dto.duplicate_bypass.matched_shop_id,
          match_type: dto.duplicate_bypass.match_type,
          action_taken: 'CREATED_ANYWAY',
          created_by_user_id: userId
        });
      }

      await queryRunner.commitTransaction();
      return savedShop;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getShops(userId: string, userRole: string, manufacturerDistributors?: string[]) {
    if (userRole === 'SUPER_ADMIN') {
      return this.shopRepo.find();
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      if (!manufacturerDistributors || manufacturerDistributors.length === 0) return [];
      return this.shopRepo.createQueryBuilder('shop')
        .where('shop.distributor_id IN (:...distIds)', { distIds: manufacturerDistributors })
        .getMany();
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) return [];
      return this.shopRepo.find({ where: { distributor_id: dist.id } });
    } else if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!salesman) return [];
      return this.shopRepo.find({ where: { distributor_id: salesman.distributor_id } });
    }
    return [];
  }

  async getShopById(id: string, userId: string, userRole: string, manufacturerDistributors?: string[]) {
    const shop = await this.shopRepo.findOne({ where: { id } });
    if (!shop) throw new NotFoundException('Shop not found');

    if (userRole === 'MANUFACTURER_ADMIN') {
      if (!manufacturerDistributors || !manufacturerDistributors.includes(shop.distributor_id)) {
        throw new ForbiddenException('Unauthorized');
      }
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist || dist.id !== shop.distributor_id) throw new ForbiddenException('Unauthorized');
    } else if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!salesman || salesman.distributor_id !== shop.distributor_id) throw new ForbiddenException('Unauthorized');
    }

    return shop;
  }

  async updateShop(id: string, dto: UpdateShopDto, userId: string, userRole: string, manufacturerDistributors?: string[]) {
    const shop = await this.getShopById(id, userId, userRole, manufacturerDistributors);

    if (userRole === 'MANUFACTURER_ADMIN') {
      throw new ForbiddenException('Manufacturers cannot edit shops');
    } else if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (shop.distributor_id !== salesman?.distributor_id) {
        throw new ForbiddenException('Salesmen can only edit shops in their territory');
      }
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      shop.location = {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      };
    }

    Object.assign(shop, dto);
    delete (shop as any).latitude;
    delete (shop as any).longitude;

    return this.shopRepo.save(shop);
  }
}
