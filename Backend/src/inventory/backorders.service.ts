import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, Not } from 'typeorm';
import { Backorder } from '../order/backorder.entity';
import { DistributorInventory } from './distributor-inventory.entity';
import { OrderItem } from '../order/order-item.entity';
import { Order } from '../order/order.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import { InventoryMovement } from './inventory-movement.entity';

@Injectable()
export class BackordersService {
  constructor(
    @InjectRepository(Backorder)
    private readonly backorderRepo: Repository<Backorder>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
    private readonly socketGateway: AppSocketGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async listBackorders(userRole: string, userId: string, filters: any = {}) {
    const query = this.backorderRepo.createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('backorder.product', 'product');

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      query.andWhere('backorder.distributor_id = :userId', { userId });
    } else if (userRole === 'SUPER_ADMIN' || userRole === 'MANUFACTURER_ADMIN') {
      if (filters.distributorId) {
        query.andWhere('backorder.distributor_id = :distributorId', { distributorId: filters.distributorId });
      }
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (filters.status) {
      query.andWhere('backorder.status = :status', { status: filters.status });
    }

    return await query.orderBy('backorder.created_at', 'ASC').getMany();
  }

  async getBackorder(id: string, userRole: string, userId: string) {
    const query = this.backorderRepo.createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('backorder.product', 'product')
      .where('backorder.id = :id', { id });

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      query.andWhere('backorder.distributor_id = :userId', { userId });
    } else if (userRole !== 'SUPER_ADMIN' && userRole !== 'MANUFACTURER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    const backorder = await query.getOne();
    if (!backorder) throw new NotFoundException('Backorder not found');
    return backorder;
  }

  async allocateBackorder(id: string, allocateQuantity: number, userId: string) {
    if (allocateQuantity <= 0) throw new BadRequestException('Allocation quantity must be greater than 0');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock Backorder
      const backorder = await queryRunner.manager.getRepository(Backorder)
        .createQueryBuilder('backorder')
        .setLock('pessimistic_write')
        .where('backorder.id = :id', { id })
        .andWhere('backorder.distributor_id = :userId', { userId })
        .getOne();

      if (!backorder) throw new NotFoundException('Backorder not found');
      if (backorder.status === 'RESOLVED') throw new BadRequestException('Backorder is already resolved');

      const unfulfilled = Number(backorder.quantity) - Number(backorder.resolved_quantity);
      if (allocateQuantity > unfulfilled) {
        throw new BadRequestException(`Cannot allocate more than unfulfilled backorder quantity (${unfulfilled})`);
      }

      // 2. Lock Inventory
      const inventory = await queryRunner.manager.getRepository(DistributorInventory)
        .createQueryBuilder('inv')
        .setLock('pessimistic_write')
        .where('inv.distributor_id = :distributorId', { distributorId: backorder.distributor_id })
        .andWhere('inv.product_id = :productId', { productId: backorder.product_id })
        .getOne();

      if (!inventory) throw new NotFoundException('Inventory not found');
      
      const availableQty = Number(inventory.available_quantity);
      if (availableQty < allocateQuantity) {
        throw new BadRequestException(`Insufficient available quantity. Have ${availableQty}, requested ${allocateQuantity}`);
      }

      // 3. Lock OrderItem
      const orderItem = await queryRunner.manager.getRepository(OrderItem)
        .createQueryBuilder('item')
        .setLock('pessimistic_write')
        .where('item.id = :itemId', { itemId: backorder.order_item_id })
        .getOne();

      if (!orderItem) throw new NotFoundException('Order item not found');

      // Update Inventory
      const previousAvailable = Number(inventory.available_quantity);
      const previousReserved = Number(inventory.reserved_quantity);
      const previousBackordered = Number(inventory.backordered_quantity);

      inventory.available_quantity = previousAvailable - allocateQuantity;
      inventory.reserved_quantity = previousReserved + allocateQuantity;
      inventory.backordered_quantity = previousBackordered - allocateQuantity;

      await queryRunner.manager.save(DistributorInventory, inventory);

      // Create Movement
      const movement = queryRunner.manager.create(InventoryMovement, {
        distributor_id: inventory.distributor_id,
        product_id: inventory.product_id,
        movement_type: 'BACKORDER_ALLOCATION',
        previous_available_quantity: previousAvailable,
        new_available_quantity: inventory.available_quantity,
        previous_reserved_quantity: previousReserved,
        new_reserved_quantity: inventory.reserved_quantity,
        previous_backordered_quantity: previousBackordered,
        new_backordered_quantity: inventory.backordered_quantity,
        quantity_change: -allocateQuantity,
        reference_type: 'backorder',
        reference_id: backorder.id,
      });
      await queryRunner.manager.save(InventoryMovement, movement);

      // Update Backorder
      const previousResolved = Number(backorder.resolved_quantity);
      backorder.resolved_quantity = previousResolved + allocateQuantity;
      
      let auditEvent = 'BACKORDER_PARTIALLY_ALLOCATED';
      let socketEvent = 'backorder:allocated';
      if (Number(backorder.resolved_quantity) === Number(backorder.quantity)) {
        backorder.status = 'RESOLVED';
        backorder.resolved_at = new Date();
        auditEvent = 'BACKORDER_RESOLVED';
        socketEvent = 'backorder:resolved';
      } else {
        backorder.status = 'PARTIALLY_ALLOCATED';
      }
      await queryRunner.manager.save(Backorder, backorder);

      // Update OrderItem
      orderItem.reserved_quantity = Number(orderItem.reserved_quantity) + allocateQuantity;
      orderItem.backordered_quantity = Number(orderItem.backordered_quantity) - allocateQuantity;
      await queryRunner.manager.save(OrderItem, orderItem);

      // Fetch Order for Notification
      const order = await queryRunner.manager.getRepository(Order).findOne({ where: { id: backorder.order_id }});

      await queryRunner.commitTransaction();

      // Post-transaction Side Effects
      await this.auditLogService.logAction(
        userId,
        auditEvent,
        'Backorder',
        backorder.id,
        {
          previous_resolved: previousResolved,
          new_resolved: backorder.resolved_quantity,
          allocated: allocateQuantity,
          status: backorder.status
        }
      );

      this.socketGateway.broadcastToRoom(`distributor:${backorder.distributor_id}`, socketEvent, {
        backorderId: backorder.id,
        allocated: allocateQuantity,
        status: backorder.status
      });

      this.socketGateway.broadcastToRoom(`distributor:${backorder.distributor_id}`, 'inventory:updated', {
        productId: inventory.product_id,
        available: inventory.available_quantity,
        reserved: inventory.reserved_quantity,
        backordered: inventory.backordered_quantity
      });

      if (order && backorder.status === 'RESOLVED') {
        await this.notificationService.createNotification(
          order.salesman_id,
          'SALESMAN',
          'Backorder Resolved',
          `Backorder for Order ${order.id} has been fully resolved. It is ready for dispatch.`,
          'BACKORDER_RESOLVED_ALERT',
          'Order',
          order.id
        );
      }

      return backorder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
