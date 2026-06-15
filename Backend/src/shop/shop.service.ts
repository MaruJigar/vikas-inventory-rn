import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shop } from './shop.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopDuplicateDetectionService } from '../shop-duplicate-detection/shop-duplicate-detection.service';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    private duplicateDetectionService: ShopDuplicateDetectionService,
    private dataSource: DataSource,
  ) {}

  async createShop(dto: CreateShopDto, userId: string, userRole: string) {
    let distributorId: string;
    let salesmanId: string | undefined = undefined;

    if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman) throw new ForbiddenException('Salesman profile not found');
      distributorId = salesman.distributor_id;
      salesmanId = salesman.id;
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      distributorId = dist.id;
    } else {
      throw new ForbiddenException(
        'Only distributors and salesmen can create shops',
      );
    }

    // Removed mandatory verification photo check

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
        verification_photo_url: dto.verification_photo_url || null,
        verification_status: dto.verification_photo_url
          ? 'VERIFIED'
          : 'PENDING',
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
          created_by_user_id: userId,
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

  async getShops(
    userId: string,
    userRole: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<Shop>> {
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

    const qb = this.shopRepo.createQueryBuilder('shop');

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
        'md.distributor_id = shop.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      qb.andWhere('shop.distributor_id = :distId', { distId: dist.id });
    } else if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman) throw new ForbiddenException('Salesman profile not found');
      qb.andWhere('shop.distributor_id = :distId', {
        distId: salesman.distributor_id,
      });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    if (search) {
      qb.andWhere(
        '(shop.name ILIKE :search OR shop.phone ILIKE :search OR shop.owner_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('shop.verification_status = :status', { status });
    }

    if (startDate)
      qb.andWhere('shop.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('shop.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = ['created_at', 'updated_at', 'name'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`shop.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('shop.created_at', 'DESC');
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

  async getShopById(id: string, userId: string, userRole: string) {
    const qb = this.shopRepo
      .createQueryBuilder('shop')
      .where('shop.id = :id', { id });

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
        'md.distributor_id = shop.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor profile not found');
      qb.andWhere('shop.distributor_id = :distId', { distId: dist.id });
    } else if (userRole === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman) throw new ForbiddenException('Salesman profile not found');
      qb.andWhere('shop.distributor_id = :distId', {
        distId: salesman.distributor_id,
      });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    const shop = await qb.getOne();
    if (!shop) throw new NotFoundException('Shop not found or unauthorized');

    return shop;
  }

  async updateShop(
    id: string,
    dto: UpdateShopDto,
    userId: string,
    userRole: string,
  ) {
    const shop = await this.getShopById(id, userId, userRole);

    if (userRole === 'MANUFACTURER_ADMIN') {
      throw new ForbiddenException('Manufacturers cannot edit shops');
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
