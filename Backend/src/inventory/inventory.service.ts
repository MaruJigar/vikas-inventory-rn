import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DistributorInventory } from './distributor-inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { NotificationService } from '../notification/notification.service';
import { Distributor } from '../distributor/distributor.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(DistributorInventory) private invRepo: Repository<DistributorInventory>,
    @InjectRepository(InventoryMovement) private movementRepo: Repository<InventoryMovement>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource, private readonly notificationService: NotificationService
  ) {}

  async getInventory(userRole: string, userId: string) {
    if (userRole === 'SUPER_ADMIN') {
      return this.invRepo.find();
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      return this.invRepo.find();
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException('Distributor not found');
      return this.invRepo.find({ where: { distributor_id: dist.id } });
    }
    throw new ForbiddenException('Cannot view inventory');
  }

  async adjustManualStock(dto: AdjustInventoryDto, userId: string, userRole: string) {
    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist || dist.id !== dto.distributor_id) {
        throw new ForbiddenException('Cannot adjust inventory for another distributor');
      }
    }

    const product = await this.productRepo.findOne({ where: { id: dto.product_id } });
    if (!product) throw new NotFoundException('Product not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let inv = await queryRunner.manager.findOne(DistributorInventory, {
        where: { distributor_id: dto.distributor_id, product_id: dto.product_id },
        lock: { mode: 'pessimistic_write' }
      });

      if (!inv) {
        inv = queryRunner.manager.create(DistributorInventory, {
          distributor_id: dto.distributor_id,
          product_id: dto.product_id,
          available_quantity: 0,
          reserved_quantity: 0,
          backordered_quantity: 0
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
        changed_by_user_id: userId
      });

      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
      return inv;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMovements(inventoryId: string, userRole: string, userId: string) {
    const inv = await this.invRepo.findOne({ where: { id: inventoryId } });
    if (!inv) throw new NotFoundException('Inventory not found');

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist || dist.id !== inv.distributor_id) {
        throw new ForbiddenException('Cannot view movements for another distributor');
      }
    }

    return this.movementRepo.find({
      where: { distributor_id: inv.distributor_id, product_id: inv.product_id },
      order: { created_at: 'DESC' }
    });
  }
}
