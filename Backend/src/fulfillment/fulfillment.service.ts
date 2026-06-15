import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderStatusHistory } from '../order/order-status-history.entity';
import { FulfillmentLog } from '../order/fulfillment-log.entity';
import { Backorder } from '../order/backorder.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { Distributor } from '../distributor/distributor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { FulfillOrderDto } from './dto/fulfill-order.dto';
import { PartialDispatchDto } from './dto/partial-dispatch.dto';
import { PartialDeliverDto } from './dto/partial-deliver.dto';

@Injectable()
export class FulfillmentService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Distributor)
    private readonly distRepo: Repository<Distributor>,
    private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
    private readonly socketGateway: AppSocketGateway,
  ) {}

  private async getDistributorOrFail(userId: string) {
    const dist = await this.distRepo.findOne({
      where: { user_id: userId },
    });
    if (!dist) throw new ForbiddenException('User is not a distributor admin');
    return dist;
  }

  private async transitionOrder(
    userId: string,
    orderId: string,
    fromStatuses: string[],
    toStatus: string,
    auditAction: string,
    dto?: FulfillOrderDto,
  ): Promise<Order> {
    const dist = await this.getDistributorOrFail(userId);
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.distributor_id !== dist.id)
      throw new ForbiddenException('Not your order');
    if (!fromStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Order must be in status ${fromStatuses.join('/')} to transition to ${toStatus}`,
      );
    }

    const oldStatus = order.status;

    await this.dataSource.transaction(async (manager) => {
      // 1. Pessimistic Write Lock on the order
      const lockedOrder = await manager.getRepository(Order).findOne({
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
      } as any);
      if (!lockedOrder)
        throw new NotFoundException('Order locked or not found');

      await manager
        .getRepository(Order)
        .update(lockedOrder.id, { status: toStatus });
      await manager.getRepository(OrderStatusHistory).save({
        order_id: lockedOrder.id,
        old_status: oldStatus,
        new_status: toStatus,
        changed_by_user_id: userId,
      } as any);
      await manager.getRepository(FulfillmentLog).save({
        order_id: lockedOrder.id,
        distributor_id: dist.id,
        action: toStatus,
        old_status: oldStatus,
        new_status: toStatus,
        performed_by_user_id: userId,
        notes: dto?.notes || undefined,
      } as any);

      // On DISPATCH: reduce inventory strictly
      if (toStatus === 'DISPATCHED') {
        const items = await manager
          .getRepository(OrderItem)
          .find({ where: { order_id: lockedOrder.id } });
        for (const item of items) {
          if (item.reserved_quantity > 0) {
            // Pessimistic write lock on inventory
            const inv = await manager
              .getRepository(DistributorInventory)
              .findOne({
                where: {
                  distributor_id: lockedOrder.distributor_id,
                  product_id: item.product_id,
                },
                lock: { mode: 'pessimistic_write' },
              } as any);
            if (!inv || inv.available_quantity < item.reserved_quantity) {
              throw new BadRequestException(
                `Insufficient inventory for product ${item.product_id} during dispatch`,
              );
            }

            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: lockedOrder.distributor_id,
                product_id: item.product_id,
              },
              'available_quantity',
              item.reserved_quantity,
            );
            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: lockedOrder.distributor_id,
                product_id: item.product_id,
              },
              'reserved_quantity',
              item.reserved_quantity,
            );
            await manager.getRepository(InventoryMovement).save({
              distributor_id: lockedOrder.distributor_id,
              product_id: item.product_id,
              order_id: lockedOrder.id,
              movement_type: 'ORDER_DISPATCHED',
              quantity_change: -item.reserved_quantity,
              changed_by_user_id: userId,
              reason: `Dispatched: Order ${lockedOrder.order_number}`,
            } as any);
            await manager.getRepository(OrderItem).update(item.id, {
              dispatched_quantity: item.reserved_quantity,
              status: 'DISPATCHED',
            });
          }

          if (item.backordered_quantity > 0) {
            await manager.getRepository(Backorder).update(
              {
                order_id: lockedOrder.id,
                product_id: item.product_id,
                status: 'OPEN',
              },
              {
                status: 'PARTIALLY_FULFILLED',
                resolved_quantity: item.reserved_quantity,
                resolved_at: new Date(),
              },
            );
          }
        }
      }

      // On DELIVER: update item delivered quantities
      if (toStatus === 'DELIVERED') {
        const items = await manager
          .getRepository(OrderItem)
          .find({ where: { order_id: lockedOrder.id } });
        for (const item of items) {
          await manager.getRepository(OrderItem).update(item.id, {
            delivered_quantity: item.dispatched_quantity,
            status: 'DELIVERED',
          });
        }
      }
    });

    await this.auditLogService.logAction(
      auditAction,
      'ORDER',
      order.id,
      userId,
      { new_status: toStatus } as any,
    );
    this.socketGateway.broadcastToRoom(
      `salesman:${order.salesman_id}`,
      'ORDER_STATUS_CHANGED',
      {
        orderId: order.id,
        newStatus: toStatus,
        timestamp: new Date(),
      } as any,
    );

    return this.orderRepo.findOne({ where: { id: orderId } }) as Promise<Order>;
  }

  async confirmOrder(userId: string, orderId: string, dto: FulfillOrderDto) {
    return this.transitionOrder(
      userId,
      orderId,
      ['CREATED'],
      'CONFIRMED',
      'ORDER_CONFIRMED',
      dto,
    );
  }

  async processingOrder(userId: string, orderId: string, dto: FulfillOrderDto) {
    return this.transitionOrder(
      userId,
      orderId,
      ['CONFIRMED'],
      'PROCESSING',
      'ORDER_PROCESSING',
      dto,
    );
  }

  async packedOrder(userId: string, orderId: string, dto: FulfillOrderDto) {
    return this.transitionOrder(
      userId,
      orderId,
      ['PROCESSING'],
      'PACKED',
      'ORDER_PACKED',
      dto,
    );
  }

  async dispatchOrder(userId: string, orderId: string, dto: FulfillOrderDto) {
    return this.transitionOrder(
      userId,
      orderId,
      ['PACKED'],
      'DISPATCHED',
      'ORDER_DISPATCHED',
      dto,
    );
  }

  async deliverOrder(userId: string, orderId: string, dto: FulfillOrderDto) {
    return this.transitionOrder(
      userId,
      orderId,
      ['DISPATCHED', 'PARTIAL_DISPATCH'],
      'DELIVERED',
      'ORDER_DELIVERED',
      dto,
    );
  }

  async partialDispatchOrder(
    userId: string,
    orderId: string,
    dto: PartialDispatchDto,
  ) {
    const dist = await this.getDistributorOrFail(userId);
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.distributor_id !== dist.id)
      throw new ForbiddenException('Not your order');
    if (order.status !== 'PACKED')
      throw new BadRequestException(
        'Order must be PACKED to partially dispatch',
      );

    const oldStatus = order.status;
    const toStatus = 'PARTIAL_DISPATCH';

    await this.dataSource.transaction(async (manager) => {
      const lockedOrder = await manager.getRepository(Order).findOne({
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
      } as any);
      if (!lockedOrder) throw new NotFoundException('Order not found');

      await manager
        .getRepository(Order)
        .update(lockedOrder.id, { status: toStatus });
      await manager.getRepository(OrderStatusHistory).save({
        order_id: lockedOrder.id,
        old_status: oldStatus,
        new_status: toStatus,
        changed_by_user_id: userId,
      } as any);
      await manager.getRepository(FulfillmentLog).save({
        order_id: lockedOrder.id,
        distributor_id: dist.id,
        action: toStatus,
        old_status: oldStatus,
        new_status: toStatus,
        performed_by_user_id: userId,
        notes: dto.notes || undefined,
      } as any);

      const items = await manager
        .getRepository(OrderItem)
        .find({ where: { order_id: lockedOrder.id } });
      for (const payloadItem of dto.items) {
        const item = items.find((i) => i.id === payloadItem.orderItemId);
        if (!item)
          throw new BadRequestException(
            `Order item ${payloadItem.orderItemId} not found`,
          );
        if (payloadItem.dispatchQuantity > item.reserved_quantity) {
          throw new BadRequestException(
            `Cannot dispatch more than reserved for product ${item.product_id}`,
          );
        }

        if (payloadItem.dispatchQuantity > 0) {
          const inv = await manager
            .getRepository(DistributorInventory)
            .findOne({
              where: {
                distributor_id: lockedOrder.distributor_id,
                product_id: item.product_id,
              },
              lock: { mode: 'pessimistic_write' },
            } as any);
          if (!inv || inv.available_quantity < payloadItem.dispatchQuantity) {
            throw new BadRequestException(
              `Insufficient inventory for product ${item.product_id}`,
            );
          }

          await manager.getRepository(DistributorInventory).decrement(
            {
              distributor_id: lockedOrder.distributor_id,
              product_id: item.product_id,
            },
            'available_quantity',
            payloadItem.dispatchQuantity,
          );
          await manager.getRepository(DistributorInventory).decrement(
            {
              distributor_id: lockedOrder.distributor_id,
              product_id: item.product_id,
            },
            'reserved_quantity',
            item.reserved_quantity,
          );

          await manager.getRepository(InventoryMovement).save({
            distributor_id: lockedOrder.distributor_id,
            product_id: item.product_id,
            order_id: lockedOrder.id,
            movement_type: 'ORDER_PARTIAL_DISPATCHED',
            quantity_change: -payloadItem.dispatchQuantity,
            changed_by_user_id: userId,
            reason: `Partial Dispatch: Order ${lockedOrder.order_number}`,
          } as any);

          await manager.getRepository(OrderItem).update(item.id, {
            dispatched_quantity: payloadItem.dispatchQuantity,
            status: 'PARTIAL_DISPATCH',
          });

          // Unfulfilled portion goes to Backorder if desired, or just freed up.
          const unfulfilled =
            item.reserved_quantity - payloadItem.dispatchQuantity;
          if (unfulfilled > 0) {
            const existingBackorder = await manager
              .getRepository(Backorder)
              .findOne({ where: { order_item_id: item.id } });
            if (existingBackorder) {
              await manager
                .getRepository(Backorder)
                .update(existingBackorder.id, {
                  quantity: existingBackorder.quantity + unfulfilled,
                });
            } else {
              const newBo = await manager.getRepository(Backorder).save({
                order_id: lockedOrder.id,
                order_item_id: item.id,
                product_id: item.product_id,
                distributor_id: lockedOrder.distributor_id,
                quantity: unfulfilled,
                status: 'OPEN',
              } as any);
              await this.auditLogService.logAction(
                'BACKORDER_CREATED',
                'BACKORDER',
                newBo.id,
                userId,
                { order_id: lockedOrder.id, quantity: unfulfilled } as any,
              );
              this.socketGateway.broadcastToRoom(
                `salesman:${order.salesman_id}`,
                'BACKORDER_CREATED',
                {
                  orderId: order.id,
                  backorderId: newBo.id,
                  timestamp: new Date(),
                } as any,
              );
            }
            await manager
              .getRepository(OrderItem)
              .increment({ id: item.id }, 'backordered_quantity', unfulfilled);
          }
        }
      }
    });

    await this.auditLogService.logAction(
      'ORDER_PARTIAL_DISPATCH',
      'ORDER',
      order.id,
      userId,
      { new_status: toStatus } as any,
    );
    this.socketGateway.broadcastToRoom(
      `salesman:${order.salesman_id}`,
      'ORDER_STATUS_CHANGED',
      { orderId: order.id, newStatus: toStatus, timestamp: new Date() } as any,
    );
    return this.orderRepo.findOne({ where: { id: orderId } }) as Promise<Order>;
  }

  async partialDeliverOrder(
    userId: string,
    orderId: string,
    dto: PartialDeliverDto,
  ) {
    const dist = await this.getDistributorOrFail(userId);
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.distributor_id !== dist.id)
      throw new ForbiddenException('Not your order');
    if (!['DISPATCHED', 'PARTIAL_DISPATCH'].includes(order.status)) {
      throw new BadRequestException(
        'Order must be DISPATCHED or PARTIAL_DISPATCH to partial deliver',
      );
    }

    const oldStatus = order.status;
    const toStatus = 'PARTIAL_DELIVERY';

    await this.dataSource.transaction(async (manager) => {
      const lockedOrder = await manager.getRepository(Order).findOne({
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
      } as any);
      if (!lockedOrder) throw new NotFoundException('Order not found');

      await manager
        .getRepository(Order)
        .update(lockedOrder.id, { status: toStatus });
      await manager.getRepository(OrderStatusHistory).save({
        order_id: lockedOrder.id,
        old_status: oldStatus,
        new_status: toStatus,
        changed_by_user_id: userId,
      } as any);
      await manager.getRepository(FulfillmentLog).save({
        order_id: lockedOrder.id,
        distributor_id: dist.id,
        action: toStatus,
        old_status: oldStatus,
        new_status: toStatus,
        performed_by_user_id: userId,
        notes: dto.notes || undefined,
      } as any);

      const items = await manager
        .getRepository(OrderItem)
        .find({ where: { order_id: lockedOrder.id } });
      for (const payloadItem of dto.items) {
        const item = items.find((i) => i.id === payloadItem.orderItemId);
        if (!item)
          throw new BadRequestException(
            `Order item ${payloadItem.orderItemId} not found`,
          );
        if (payloadItem.deliverQuantity > item.dispatched_quantity) {
          throw new BadRequestException(
            `Cannot deliver more than dispatched for product ${item.product_id}`,
          );
        }
        await manager.getRepository(OrderItem).update(item.id, {
          delivered_quantity: payloadItem.deliverQuantity,
          status: 'PARTIAL_DELIVERY',
        });
      }
    });

    await this.auditLogService.logAction(
      'ORDER_PARTIAL_DELIVERY',
      'ORDER',
      order.id,
      userId,
      { new_status: toStatus } as any,
    );
    this.socketGateway.broadcastToRoom(
      `salesman:${order.salesman_id}`,
      'ORDER_STATUS_CHANGED',
      { orderId: order.id, newStatus: toStatus, timestamp: new Date() } as any,
    );
    return this.orderRepo.findOne({ where: { id: orderId } }) as Promise<Order>;
  }
}
