import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, Not } from 'typeorm';
import { Backorder } from '../order/backorder.entity';
import { DistributorInventory } from './distributor-inventory.entity';
import { OrderItem } from '../order/order-item.entity';
import { Order } from '../order/order.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { NotificationQueueService } from '../notification/notification-queue.service';
import { InventoryMovement } from './inventory-movement.entity';

@Injectable()
export class BackordersService {
  constructor(
    @InjectRepository(Backorder)
    private readonly backorderRepo: Repository<Backorder>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
    private readonly socketGateway: AppSocketGateway,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  async listBackorders(
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
      status,
    } = queryDto;
    const skip = (page - 1) * limit;

    const query = this.backorderRepo
      .createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('backorder.product', 'product');

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource.query(
        `SELECT id FROM distributors WHERE user_id = $1`,
        [userId],
      );
      if (!dist.length) throw new ForbiddenException('Distributor not found');
      query.andWhere('backorder.distributor_id = :distId', {
        distId: dist[0].id,
      });
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length)
        throw new ForbiddenException('Manufacturer profile not found');

      query.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = backorder.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'SUPER_ADMIN') {
      // Global
    } else {
      throw new ForbiddenException('Access denied');
    }

    if (status) {
      query.andWhere('backorder.status = :status', { status });
    }

    if (startDate)
      query.andWhere('backorder.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      query.andWhere('backorder.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = ['created_at', 'updated_at', 'status'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      query.orderBy(`backorder.${sortBy}`, sortOrder);
    } else {
      query.orderBy('backorder.created_at', 'DESC');
    }

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
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

  async getBackorder(id: string, userRole: string, userId: string) {
    const query = this.backorderRepo
      .createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('backorder.product', 'product')
      .where('backorder.id = :id', { id });

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource.query(
        `SELECT id FROM distributors WHERE user_id = $1`,
        [userId],
      );
      if (!dist.length) throw new ForbiddenException('Distributor not found');
      query.andWhere('backorder.distributor_id = :distId', {
        distId: dist[0].id,
      });
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(
        `SELECT id FROM manufacturers WHERE user_id = $1`,
        [userId],
      );
      if (!mfrResult.length)
        throw new ForbiddenException('Manufacturer profile not found');

      query.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = backorder.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    } else if (userRole === 'SUPER_ADMIN') {
      // Global
    } else {
      throw new ForbiddenException('Access denied');
    }

    const backorder = await query.getOne();
    if (!backorder) throw new NotFoundException('Backorder not found');
    return backorder;
  }

  async allocateBackorder(
    id: string,
    allocateQuantity: number,
    userId: string,
  ) {
    if (allocateQuantity <= 0)
      throw new BadRequestException(
        'Allocation quantity must be greater than 0',
      );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Lock Backorder
      const backorder = await queryRunner.manager
        .getRepository(Backorder)
        .createQueryBuilder('backorder')
        .setLock('pessimistic_write')
        .where('backorder.id = :id', { id })
        .andWhere('backorder.distributor_id = :userId', { userId })
        .getOne();

      if (!backorder) throw new NotFoundException('Backorder not found');
      if (backorder.status === 'RESOLVED')
        throw new BadRequestException('Backorder is already resolved');

      const unfulfilled =
        Number(backorder.quantity) - Number(backorder.resolved_quantity);
      if (allocateQuantity > unfulfilled) {
        throw new BadRequestException(
          `Cannot allocate more than unfulfilled backorder quantity (${unfulfilled})`,
        );
      }

      // 2. Lock Inventory
      const inventory = await queryRunner.manager
        .getRepository(DistributorInventory)
        .createQueryBuilder('inv')
        .setLock('pessimistic_write')
        .where('inv.distributor_id = :distributorId', {
          distributorId: backorder.distributor_id,
        })
        .andWhere('inv.product_id = :productId', {
          productId: backorder.product_id,
        })
        .getOne();

      if (!inventory) throw new NotFoundException('Inventory not found');

      const availableQty = Number(inventory.available_quantity);
      if (availableQty < allocateQuantity) {
        throw new BadRequestException(
          `Insufficient available quantity. Have ${availableQty}, requested ${allocateQuantity}`,
        );
      }

      // 3. Lock OrderItem
      const orderItem = await queryRunner.manager
        .getRepository(OrderItem)
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
      orderItem.reserved_quantity =
        Number(orderItem.reserved_quantity) + allocateQuantity;
      orderItem.backordered_quantity =
        Number(orderItem.backordered_quantity) - allocateQuantity;
      await queryRunner.manager.save(OrderItem, orderItem);

      // Fetch Order for Notification
      const order = await queryRunner.manager
        .getRepository(Order)
        .findOne({ where: { id: backorder.order_id } });

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
          status: backorder.status,
        },
      );

      this.socketGateway.broadcastToRoom(
        `distributor:${backorder.distributor_id}`,
        socketEvent,
        {
          backorderId: backorder.id,
          allocated: allocateQuantity,
          status: backorder.status,
        },
      );

      this.socketGateway.broadcastToRoom(
        `distributor:${backorder.distributor_id}`,
        'inventory:updated',
        {
          productId: inventory.product_id,
          available: inventory.available_quantity,
          reserved: inventory.reserved_quantity,
          backordered: inventory.backordered_quantity,
        },
      );

      if (order && backorder.status === 'RESOLVED') {
        // Enqueue notification safely out-of-band
        await this.notificationQueueService.enqueueNotification(
          order.salesman_id,
          'SALESMAN',
          'Backorder Resolved',
          `Backorder for Order ${order.id} has been fully resolved. It is ready for dispatch.`,
          'BACKORDER_RESOLVED_ALERT',
          'Order',
          order.id,
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

  async getBackordersReport(
    userRole: string,
    userId: string,
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    customStart?: string,
    customEnd?: string,
  ) {
    let startDate: string | undefined = customStart;
    let endDate: string | undefined = customEnd;

    if (period) {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      endDate = end.toISOString();

      if (period === 'daily') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString();
      } else if (period === 'weekly') {
        const start = new Date(now);
        const day = start.getDay();
        start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        startDate = start.toISOString();
      } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (period === 'quarterly') {
        const m = now.getMonth();
        const qm = m >= 3 && m <= 5 ? 3 : m >= 6 && m <= 8 ? 6 : m >= 9 && m <= 11 ? 9 : 0;
        startDate = new Date(now.getFullYear(), qm, 1).toISOString();
      } else if (period === 'yearly') {
        const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(fy, 3, 1).toISOString();
      }
    }

    const qb = this.backorderRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'product')
      .leftJoinAndSelect('b.distributor', 'distributor');

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource.query(`SELECT id FROM distributors WHERE user_id = $1`, [userId]);
      if (!dist.length) throw new ForbiddenException('Distributor not found');
      qb.andWhere('b.distributor_id = :distId', { distId: dist[0].id });
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrResult = await this.dataSource.query(`SELECT id FROM manufacturers WHERE user_id = $1`, [userId]);
      if (!mfrResult.length) throw new ForbiddenException('Manufacturer profile not found');
      qb.innerJoin(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = b.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: mfrResult[0].id },
      );
    }

    if (startDate) qb.andWhere('b.created_at >= :startDate', { startDate: new Date(startDate) });
    if (endDate) qb.andWhere('b.created_at <= :endDate', { endDate: new Date(endDate) });

    const rawSummary = await qb
      .select('COUNT(b.id)', 'total_backorders')
      .addSelect("SUM(CASE WHEN b.status = 'OPEN' THEN 1 ELSE 0 END)", 'open_count')
      .addSelect("SUM(CASE WHEN b.status = 'PARTIALLY_ALLOCATED' THEN 1 ELSE 0 END)", 'partially_allocated_count')
      .addSelect("SUM(CASE WHEN b.status = 'RESOLVED' THEN 1 ELSE 0 END)", 'resolved_count')
      .addSelect('SUM(b.quantity)', 'total_quantity')
      .addSelect('SUM(b.resolved_quantity)', 'total_resolved_quantity')
      .addSelect('SUM(b.quantity - b.resolved_quantity)', 'pending_quantity')
      .addSelect('SUM((b.quantity - b.resolved_quantity) * COALESCE(product.mrp, 0))', 'estimated_unfulfilled_value')
      .getRawOne();

    // Distributor pending demand
    const distDemandRaw = await qb
      .clone()
      .select('distributor.id', 'distributor_id')
      .addSelect('distributor.business_name', 'distributor_name')
      .addSelect('COUNT(b.id)', 'backorder_count')
      .addSelect('SUM(b.quantity - b.resolved_quantity)', 'pending_quantity')
      .addSelect('SUM((b.quantity - b.resolved_quantity) * COALESCE(product.mrp, 0))', 'unfulfilled_value')
      .groupBy('distributor.id')
      .addGroupBy('distributor.business_name')
      .orderBy('pending_quantity', 'DESC')
      .getRawMany();

    // Top backordered products
    const productDemandRaw = await qb
      .clone()
      .select('product.id', 'product_id')
      .addSelect('product.name', 'product_name')
      .addSelect('product.sku', 'sku')
      .addSelect('SUM(b.quantity - b.resolved_quantity)', 'pending_quantity')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.sku')
      .orderBy('pending_quantity', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      period: period || 'custom',
      dateRange: { startDate, endDate },
      summary: {
        totalBackorders: Number(rawSummary?.total_backorders || 0),
        openCount: Number(rawSummary?.open_count || 0),
        partiallyAllocatedCount: Number(rawSummary?.partially_allocated_count || 0),
        resolvedCount: Number(rawSummary?.resolved_count || 0),
        totalQuantity: Number(rawSummary?.total_quantity || 0),
        resolvedQuantity: Number(rawSummary?.total_resolved_quantity || 0),
        pendingQuantity: Number(rawSummary?.pending_quantity || 0),
        estimatedUnfulfilledValue: Number(rawSummary?.estimated_unfulfilled_value || 0),
      },
      distributorDemand: distDemandRaw.map((d) => ({
        distributorId: d.distributor_id,
        distributorName: d.distributor_name,
        backorderCount: Number(d.backorder_count),
        pendingQuantity: Number(d.pending_quantity),
        unfulfilledValue: Number(d.unfulfilled_value),
      })),
      productDemand: productDemandRaw.map((p) => ({
        productId: p.product_id,
        productName: p.product_name,
        sku: p.sku,
        pendingQuantity: Number(p.pending_quantity),
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}
