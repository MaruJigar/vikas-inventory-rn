import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DistributorInventory } from './distributor-inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { ManufacturerInventory } from './manufacturer-inventory.entity';
import { ManufacturerInventoryMovement } from './manufacturer-inventory-movement.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { NotificationService } from '../notification/notification.service';
import { Distributor } from '../distributor/distributor.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(DistributorInventory)
    private invRepo: Repository<DistributorInventory>,
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,
    @InjectRepository(ManufacturerInventory)
    private mfrInvRepo: Repository<ManufacturerInventory>,
    @InjectRepository(ManufacturerInventoryMovement)
    private mfrMovementRepo: Repository<ManufacturerInventoryMovement>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async getInventory(
    userRole: string,
    userId: string,
    queryDto: ListQueryDto = {} as any,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      startDate,
      endDate,
    } = queryDto;
    const skip = (page - 1) * limit;

    let qb: any;

    if (userRole === 'SUPER_ADMIN') {
      qb = this.invRepo.createQueryBuilder('inv');
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      qb = this.invRepo.createQueryBuilder('inv');
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor not found');
      qb.andWhere('inv.distributor_id = :distId', { distId: dist.id });
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      qb = this.mfrInvRepo.createQueryBuilder('inv');
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length)
        throw new ForbiddenException('Manufacturer profile not found');
      
      qb.andWhere('inv.manufacturer_id = :mfrId', { mfrId: mfrResult[0].id });
    } else {
      throw new ForbiddenException('Cannot view inventory');
    }

    if (startDate)
      qb.andWhere('inv.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('inv.created_at <= :endDate', { endDate: new Date(endDate) });

    const allowedSortFields = [
      'created_at',
      'updated_at',
      'available_quantity',
      'reserved_quantity',
      'backordered_quantity',
    ];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`inv.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('inv.updated_at', 'DESC');
    }

    qb.leftJoinAndSelect('inv.product', 'product');

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

  async adjustManualStock(
    dto: AdjustInventoryDto,
    userId: string,
    userRole: string,
  ) {
    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) {
        throw new ForbiddenException('Distributor profile not found');
      }
      dto.distributor_id = dist.id;
      dto.manufacturer_id = undefined;
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length) {
        throw new ForbiddenException('Manufacturer profile not found');
      }
      dto.manufacturer_id = mfrResult[0].id;
      dto.distributor_id = undefined;
    } else {
      if (!dto.distributor_id && !dto.manufacturer_id) {
        throw new BadRequestException('Must provide either distributor_id or manufacturer_id');
      }
      if (dto.distributor_id && dto.manufacturer_id) {
        throw new BadRequestException('Cannot provide both distributor_id and manufacturer_id');
      }
    }

    const product = await this.productRepo.findOne({
      where: { id: dto.product_id },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (userRole === 'DISTRIBUTOR_ADMIN' && product.distributor_id !== dto.distributor_id) {
      throw new ForbiddenException('You can only adjust inventory for products you own');
    }
    if (userRole === 'MANUFACTURER_ADMIN' && product.manufacturer_id !== dto.manufacturer_id) {
      throw new ForbiddenException('You can only adjust inventory for products you own');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (dto.distributor_id) {
        let inv = await queryRunner.manager.findOne(DistributorInventory, {
          where: {
            distributor_id: dto.distributor_id,
            product_id: dto.product_id,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inv) {
          inv = queryRunner.manager.create(DistributorInventory, {
            distributor_id: dto.distributor_id,
            product_id: dto.product_id,
            available_quantity: 0,
            reserved_quantity: 0,
            backordered_quantity: 0,
          });
        }

        const previous_available = Number(inv.available_quantity) || 0;
        const new_available = previous_available + Number(dto.quantity_change);
        inv.available_quantity = new_available;
        await queryRunner.manager.save(inv);

        const movement = queryRunner.manager.create(InventoryMovement, {
          distributor_id: dto.distributor_id,
          product_id: dto.product_id,
          movement_type: dto.movement_type,
          quantity_change: dto.quantity_change,
          previous_available_quantity: previous_available,
          new_available_quantity: new_available,
          previous_reserved_quantity: inv.reserved_quantity,
          new_reserved_quantity: inv.reserved_quantity,
          previous_backordered_quantity: inv.backordered_quantity,
          new_backordered_quantity: inv.backordered_quantity,
          reason: dto.reason,
          changed_by_user_id: userId,
        });

        await queryRunner.manager.save(movement);
        await queryRunner.commitTransaction();
        return inv;
      } else if (dto.manufacturer_id) {
        let inv = await queryRunner.manager.findOne(ManufacturerInventory, {
          where: {
            manufacturer_id: dto.manufacturer_id,
            product_id: dto.product_id,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!inv) {
          inv = queryRunner.manager.create(ManufacturerInventory, {
            manufacturer_id: dto.manufacturer_id,
            product_id: dto.product_id,
            available_quantity: 0,
            reserved_quantity: 0,
            backordered_quantity: 0,
          });
        }

        const previous_available = Number(inv.available_quantity) || 0;
        const new_available = previous_available + Number(dto.quantity_change);
        inv.available_quantity = new_available;
        await queryRunner.manager.save(inv);

        const movement = queryRunner.manager.create(ManufacturerInventoryMovement, {
          manufacturer_id: dto.manufacturer_id,
          product_id: dto.product_id,
          movement_type: dto.movement_type,
          quantity_change: dto.quantity_change,
          previous_available_quantity: previous_available,
          new_available_quantity: new_available,
          previous_reserved_quantity: inv.reserved_quantity,
          new_reserved_quantity: inv.reserved_quantity,
          previous_backordered_quantity: inv.backordered_quantity,
          new_backordered_quantity: inv.backordered_quantity,
          reason: dto.reason,
          changed_by_user_id: userId,
        });

        await queryRunner.manager.save(movement);
        await queryRunner.commitTransaction();
        return inv;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMovements(
    inventoryId: string,
    userRole: string,
    userId: string,
    queryDto: ListQueryDto = {} as any,
    isManufacturer: boolean = false,
  ): Promise<PaginatedResponse<any>> {
    let inv: any;
    
    if (isManufacturer || userRole === 'MANUFACTURER_ADMIN') {
      inv = await this.mfrInvRepo.findOne({ where: { id: inventoryId } });
      if (!inv) throw new NotFoundException('Manufacturer Inventory not found');
      
      if (userRole === 'MANUFACTURER_ADMIN') {
        const mfrResult = await this.dataSource.query(
          `SELECT id FROM manufacturers WHERE user_id = $1`,
          [userId],
        );
        if (!mfrResult.length || mfrResult[0].id !== inv.manufacturer_id)
          throw new ForbiddenException('Cannot view movements for another manufacturer');
      }
    } else {
      inv = await this.invRepo.findOne({ where: { id: inventoryId } });
      if (!inv) throw new NotFoundException('Distributor Inventory not found');

      if (userRole === 'DISTRIBUTOR_ADMIN') {
        const dist = await this.distRepo.findOne({ where: { user_id: userId } });
        if (!dist || dist.id !== inv.distributor_id) {
          throw new ForbiddenException(
            'Cannot view movements for another distributor',
          );
        }
      }
    }

    const {
      page = 1,
      limit = 20,
      sortBy,
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = queryDto;
    const skip = (page - 1) * limit;

    let qb: any;
    if (isManufacturer || userRole === 'MANUFACTURER_ADMIN') {
      qb = this.mfrMovementRepo
        .createQueryBuilder('movement')
        .where('movement.manufacturer_id = :mId', { mId: inv.manufacturer_id })
        .andWhere('movement.product_id = :pId', { pId: inv.product_id });
    } else {
      qb = this.movementRepo
        .createQueryBuilder('movement')
        .where('movement.distributor_id = :dId', { dId: inv.distributor_id })
        .andWhere('movement.product_id = :pId', { pId: inv.product_id });
    }

    if (status) qb.andWhere('movement.movement_type = :status', { status });
    if (startDate)
      qb.andWhere('movement.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('movement.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = ['created_at'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`movement.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('movement.created_at', 'DESC');
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
}
