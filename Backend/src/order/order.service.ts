import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderRevision } from './order-revision.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Backorder } from './backorder.entity';
import { FulfillmentLog } from './fulfillment-log.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { Shop } from '../shop/shop.entity';
import { Product } from '../product/product.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, CancelOrderDto } from './dto/update-order.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { BackorderListQueryDto } from './dto/backorder-list-query.dto';
import { ResolveBackorderDto } from './dto/resolve-backorder.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatusService } from '../order-status/order-status.service';
import * as ExcelJS from 'exceljs';
import * as stream from 'stream';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderRevision)
    private revisionRepo: Repository<OrderRevision>,
    @InjectRepository(OrderStatusHistory)
    private statusHistoryRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Backorder) private backorderRepo: Repository<Backorder>,
    @InjectRepository(FulfillmentLog)
    private fulfillmentLogRepo: Repository<FulfillmentLog>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Manufacturer) private mfrRepo: Repository<Manufacturer>,
    @InjectRepository(ManufacturerDistributor)
    private mfrDistRepo: Repository<ManufacturerDistributor>,
    @InjectRepository(ShopVisit) private visitRepo: Repository<ShopVisit>,
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(DistributorInventory)
    private inventoryRepo: Repository<DistributorInventory>,
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway,
    private orderStatusService: OrderStatusService,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private generateOrderNumber(): string {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const seq = Math.floor(100000 + Math.random() * 900000); // 6-digit
    return `ORD-${ymd}-${seq}`;
  }

  private calcItemDiscount(
    discountType: string,
    discountValue: number,
    grossAmount: number,
  ): number {
    if (!discountType || discountType === 'NONE' || !discountValue) return 0;
    if (discountType === 'PERCENTAGE')
      return (discountValue / 100) * grossAmount;
    return discountValue; // FLAT
  }

  private calcBillDiscount(
    discountType: string,
    discountValue: number,
    grossAfterItemDiscounts: number,
  ): number {
    if (!discountType || discountType === 'NONE' || !discountValue) return 0;
    if (discountType === 'PERCENTAGE')
      return (discountValue / 100) * grossAfterItemDiscounts;
    return discountValue; // FLAT
  }

  private async getSalesmanOrFail(userId: string): Promise<Salesman> {
    const salesman = await this.salesmanRepo.findOne({
      where: { user_id: userId },
    });
    if (!salesman)
      throw new ForbiddenException('Only salesmen can perform this action');
    if (salesman.approval_status !== 'APPROVED')
      throw new ForbiddenException('Salesman is not approved');
    return salesman;
  }

  private async getDistributorOrFail(userId: string): Promise<Distributor> {
    const dist = await this.distRepo.findOne({ where: { user_id: userId } });
    if (!dist) throw new ForbiddenException('Distributor not found');
    return dist;
  }

  private async verifyOrderOwnership(
    order: Order,
    role: string,
    userId: string,
  ): Promise<void> {
    if (role === 'SUPER_ADMIN') return;
    if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      if (order.distributor_id !== dist.id)
        throw new ForbiddenException('Not your order');
      return;
    }
    if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      const linked = await this.mfrDistRepo.findOne({
        where: {
          manufacturer_id: mfr.id,
          distributor_id: order.distributor_id,
        },
      });
      if (!linked) throw new ForbiddenException('Not in your ecosystem');
      return;
    }
    if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman || salesman.id !== order.salesman_id)
        throw new ForbiddenException('Not your order');
      return;
    }
    throw new ForbiddenException('Unauthorized role');
  }

  // ─── createOrder ─────────────────────────────────────────────────────────
  // Architecture Decision: Only SALESMAN role can create orders.
  // Orders require a salesman profile context (distributor_id, salesman_id).
  // SUPER_ADMIN is removed from @Roles() in the controller.

  async createOrder(userId: string, dto: CreateOrderDto) {
    const salesman = await this.getSalesmanOrFail(userId);

    // Idempotency check
    if (dto.idempotencyKey) {
      const existing = await this.orderRepo.findOne({
        where: { idempotency_key: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    // Validate visit
    const visit = await this.visitRepo.findOne({ where: { id: dto.visitId } });
    if (!visit) throw new NotFoundException('Visit not found');
    if (visit.salesman_id !== salesman.id)
      throw new ForbiddenException('Visit does not belong to you');
    if (visit.status !== 'ACTIVE')
      throw new BadRequestException('Visit is not active');

    // Validate shop
    const shop = await this.shopRepo.findOne({ where: { id: dto.shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.distributor_id !== salesman.distributor_id)
      throw new ForbiddenException('Shop not in your distributor');
    if (visit.shop_id !== shop.id)
      throw new BadRequestException('Shop does not match the visit shop');

    if (!dto.products || dto.products.length === 0)
      throw new BadRequestException('At least one product is required');

    const initialStatus = await this.orderStatusService.getInitialStatus();

    const { savedOrder, createdBackorders } = await this.dataSource.transaction(
      async (manager) => {
        let grossOrderAmount = 0;
        let totalProductDiscountAmount = 0;
        let totalQuantity = 0;
        let totalBackorderedQty = 0;
        const itemsData: Partial<OrderItem>[] = [];
        const inventoryActions: {
          inventoryId: string | undefined;
          reservable: number;
          backorder: number;
          product: Product;
          itemIndex: number;
        }[] = [];
        const createdBackordersArray: any[] = [];

        for (let i = 0; i < dto.products.length; i++) {
          const p = dto.products[i];
          const product = await this.productRepo.findOne({
            where: { id: p.productId },
          });
          if (!product)
            throw new NotFoundException(`Product ${p.productId} not found`);

          const grossLineAmount = Number(product.mrp) * Number(p.quantity);
          const discountType = p.itemDiscountType || 'NONE';
          const discountValue = p.itemDiscountValue || 0;
          const itemDiscountAmount = this.calcItemDiscount(
            discountType,
            discountValue,
            grossLineAmount,
          );
          const netLineAmount = grossLineAmount - itemDiscountAmount;

          grossOrderAmount += netLineAmount;
          totalProductDiscountAmount += itemDiscountAmount;
          totalQuantity += Number(p.quantity);

          // Check inventory
          const inv = await manager
            .getRepository(DistributorInventory)
            .findOne({
              where: {
                distributor_id: salesman.distributor_id,
                product_id: p.productId,
              },
              lock: { mode: 'pessimistic_write' },
            });

          const availableQty = inv ? Number(inv.available_quantity) : 0;
          const reservable = Math.min(availableQty, Number(p.quantity));
          const backorderQty = Number(p.quantity) - reservable;
          totalBackorderedQty += backorderQty;

          itemsData.push({
            product_id: p.productId,
            product_name_snapshot: product.name,
            sku_snapshot: (product as any).sku || null,
            manufacturer_name_snapshot:
              (product as any).manufacturer_name || null,
            quantity: Number(p.quantity),
            mrp: Number(product.mrp),
            gross_line_amount: grossLineAmount,
            item_discount_type: discountType,
            item_discount_value: discountValue,
            item_discount_amount: itemDiscountAmount,
            net_line_amount: netLineAmount,
            reserved_quantity: reservable,
            backordered_quantity: backorderQty,
            dispatched_quantity: 0,
            delivered_quantity: 0,
            status_id: initialStatus.id,
          });

          inventoryActions.push({
            inventoryId: inv?.id,
            reservable,
            backorder: backorderQty,
            product,
            itemIndex: i,
          });
        }

        const billDiscountType = dto.billDiscountType || 'NONE';
        const billDiscountValue = dto.billDiscountValue || 0;
        const billDiscountAmount = this.calcBillDiscount(
          billDiscountType,
          billDiscountValue,
          grossOrderAmount,
        );
        const finalOrderAmount = grossOrderAmount - billDiscountAmount;

        // Create order
        const order = manager.getRepository(Order).create({
          order_number: this.generateOrderNumber(),
          visit_id: visit.id,
          shop_id: shop.id,
          salesman_id: salesman.id,
          distributor_id: salesman.distributor_id,
          status_id: initialStatus.id,
          gross_order_amount: grossOrderAmount,
          total_product_discount_amount: totalProductDiscountAmount,
          bill_discount_type: billDiscountType,
          bill_discount_value: billDiscountValue,
          bill_discount_amount: billDiscountAmount,
          final_order_amount: finalOrderAmount,
          total_quantity: totalQuantity,
          total_backordered_quantity: totalBackorderedQty,
          is_offline_created: dto.isOfflineCreated || false,
          idempotency_key: dto.idempotencyKey || undefined,
        });
        const savedOrderRec = await manager.getRepository(Order).save(order);

        // Save items and update inventory
        for (let i = 0; i < itemsData.length; i++) {
          itemsData[i].order_id = savedOrderRec.id;
          const savedItem = await manager
            .getRepository(OrderItem)
            .save(itemsData[i]);

          const inv = inventoryActions[i];
          if (inv.reservable > 0 || inv.backorder > 0) {
            if (inv.inventoryId) {
              await manager
                .getRepository(DistributorInventory)
                .increment(
                  { id: inv.inventoryId },
                  'reserved_quantity',
                  inv.reservable,
                );
              if (inv.backorder > 0) {
                await manager
                  .getRepository(DistributorInventory)
                  .increment(
                    { id: inv.inventoryId },
                    'backordered_quantity',
                    inv.backorder,
                  );
              }
            }

            if (inv.reservable > 0) {
              await manager.getRepository(InventoryMovement).save({
                distributor_id: salesman.distributor_id,
                product_id: inv.product.id,
                order_id: savedOrderRec.id,
                movement_type: 'ORDER_RESERVED',
                quantity_change: inv.reservable,
                changed_by_user_id: userId,
                reason: `Order ${savedOrderRec.order_number}`,
              });
            }

            if (inv.backorder > 0) {
              await manager.getRepository(InventoryMovement).save({
                distributor_id: salesman.distributor_id,
                product_id: inv.product.id,
                order_id: savedOrderRec.id,
                movement_type: 'ORDER_BACKORDERED',
                quantity_change: inv.backorder,
                changed_by_user_id: userId,
                reason: `Backorder for Order ${savedOrderRec.order_number}`,
              });
              const savedBackorder = await manager
                .getRepository(Backorder)
                .save({
                  order_id: savedOrderRec.id,
                  order_item_id: savedItem.id,
                  product_id: inv.product.id,
                  distributor_id: salesman.distributor_id,
                  quantity: inv.backorder,
                  status: 'OPEN',
                });
              createdBackordersArray.push({
                id: savedBackorder.id,
                order_item_id: savedItem.id,
                product_id: inv.product.id,
                quantity: inv.backorder,
              });
            }
          }
        }

        // Status history
        await manager.getRepository(OrderStatusHistory).save({
          order_id: savedOrderRec.id,
          old_status_id: undefined,
          new_status_id: initialStatus.id,
          changed_by_user_id: userId,
        });

        return {
          savedOrder: savedOrderRec,
          createdBackorders: createdBackordersArray,
        };
      },
    );

    await this.auditLogService.logAction(
      'ORDER_CREATED',
      'ORDER',
      savedOrder.id,
      userId,
      { order_number: savedOrder.order_number },
    );

    this.socketGateway.broadcastToRoom(
      `distributor:${savedOrder.distributor_id}`,
      'NEW_ORDER',
      {
        orderId: savedOrder.id,
        shopId: savedOrder.shop_id,
        salesmanId: savedOrder.salesman_id,
        grossAmount: savedOrder.final_order_amount,
        timestamp: savedOrder.created_at,
      },
    );

    if (savedOrder.total_backordered_quantity > 0) {
      this.socketGateway.broadcastToRoom(
        `distributor:${savedOrder.distributor_id}`,
        'BACKORDER_CREATED',
        {
          orderId: savedOrder.id,
          backordered_quantity: savedOrder.total_backordered_quantity,
        },
      );

      for (const bo of createdBackorders) {
        await this.auditLogService.logAction(
          'BACKORDER_CREATED',
          'BACKORDER',
          bo.id,
          userId,
          {
            orderId: savedOrder.id,
            orderItemId: bo.order_item_id,
            productId: bo.product_id,
            distributorId: savedOrder.distributor_id,
            quantity: bo.quantity,
            orderNumber: savedOrder.order_number,
          },
        );
      }
    }

    return savedOrder;
  }

  // ─── updateOrder ─────────────────────────────────────────────────────────
  // Architecture Decision: Only SALESMAN role can edit orders.
  // Editing requires the original salesman's context for inventory re-allocation.
  // SUPER_ADMIN is removed from @Roles() in the controller.

  async updateOrder(userId: string, orderId: string, dto: UpdateOrderDto) {
    const salesman = await this.getSalesmanOrFail(userId);
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { status: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.salesman_id !== salesman.id)
      throw new ForbiddenException('Not your order');
    const finalStatus = await this.orderStatusService.getFinalDeliveredStatus();
    const preDispatchStatuses = await this.orderStatusService.getPreDispatchStatuses();

    if (order.status.is_cancel_status || order.status_id === finalStatus.id) {
      throw new BadRequestException(
        'Cannot edit a cancelled or delivered order',
      );
    }

    const isPostDispatch = !preDispatchStatuses.includes(order.status_id);
    const oldData = { ...order };

    const initialStatus = await this.orderStatusService.getInitialStatus();

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const existingItems = await manager
        .getRepository(OrderItem)
        .find({ where: { order_id: order.id } });

      // Release previous reservations (pre-dispatch only)
      if (!isPostDispatch) {
        for (const item of existingItems) {
          if (item.reserved_quantity > 0) {
            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: order.distributor_id,
                product_id: item.product_id,
              },
              'reserved_quantity',
              item.reserved_quantity,
            );
          }
          if (item.backordered_quantity > 0) {
            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: order.distributor_id,
                product_id: item.product_id,
              },
              'backordered_quantity',
              item.backordered_quantity,
            );
            await manager.getRepository(Backorder).update(
              {
                order_id: order.id,
                product_id: item.product_id,
                status: 'OPEN',
              },
              { status: 'CANCELLED' },
            );
          }
        }
      }

      // Delete existing items and re-create
      await manager.getRepository(OrderItem).delete({ order_id: order.id });

      let grossOrderAmount = 0;
      let totalProductDiscountAmount = 0;
      let totalQuantity = 0;
      let totalBackorderedQty = 0;

      for (const p of dto.products) {
        const product = await this.productRepo.findOne({
          where: { id: p.productId },
        });
        if (!product)
          throw new NotFoundException(`Product ${p.productId} not found`);

        const grossLineAmount = Number(product.mrp) * Number(p.quantity);
        const discountType = p.itemDiscountType || 'NONE';
        const discountValue = p.itemDiscountValue || 0;
        const itemDiscountAmount = this.calcItemDiscount(
          discountType,
          discountValue,
          grossLineAmount,
        );
        const netLineAmount = grossLineAmount - itemDiscountAmount;

        grossOrderAmount += netLineAmount;
        totalProductDiscountAmount += itemDiscountAmount;
        totalQuantity += Number(p.quantity);

        let reservable = Number(p.quantity);
        let backorderQty = 0;

        if (!isPostDispatch) {
          const inv = await manager
            .getRepository(DistributorInventory)
            .findOne({
              where: {
                distributor_id: order.distributor_id,
                product_id: p.productId,
              },
              lock: { mode: 'pessimistic_write' },
            });
          const availableQty = inv ? Number(inv.available_quantity) : 0;
          reservable = Math.min(availableQty, Number(p.quantity));
          backorderQty = Number(p.quantity) - reservable;
          totalBackorderedQty += backorderQty;

          if (inv) {
            await manager
              .getRepository(DistributorInventory)
              .increment({ id: inv.id }, 'reserved_quantity', reservable);
            if (backorderQty > 0) {
              await manager
                .getRepository(DistributorInventory)
                .increment(
                  { id: inv.id },
                  'backordered_quantity',
                  backorderQty,
                );
              await manager.getRepository(Backorder).save({
                order_id: order.id,
                order_item_id: null,
                product_id: p.productId,
                distributor_id: order.distributor_id,
                quantity: backorderQty,
                status: 'OPEN',
              } as any);
            }
          }
        }

        await manager.getRepository(OrderItem).save({
          order_id: order.id,
          product_id: p.productId,
          product_name_snapshot: product.name,
          quantity: Number(p.quantity),
          mrp: Number(product.mrp),
          gross_line_amount: grossLineAmount,
          item_discount_type: discountType,
          item_discount_value: discountValue,
          item_discount_amount: itemDiscountAmount,
          net_line_amount: netLineAmount,
          reserved_quantity: reservable,
          backordered_quantity: backorderQty,
          dispatched_quantity: 0,
          delivered_quantity: 0,
          status_id: initialStatus.id,
        });
      }

      const billDiscountType = dto.billDiscountType || order.bill_discount_type;
      const billDiscountValue =
        dto.billDiscountValue ?? order.bill_discount_value;
      const billDiscountAmount = this.calcBillDiscount(
        billDiscountType,
        billDiscountValue,
        grossOrderAmount,
      );
      const finalOrderAmount = grossOrderAmount - billDiscountAmount;

      const revisionCount = await manager
        .getRepository(OrderRevision)
        .count({ where: { order_id: order.id } });

      const newData = {
        gross_order_amount: grossOrderAmount,
        total_product_discount_amount: totalProductDiscountAmount,
        bill_discount_type: billDiscountType,
        bill_discount_value: billDiscountValue,
        bill_discount_amount: billDiscountAmount,
        final_order_amount: finalOrderAmount,
        total_quantity: totalQuantity,
        total_backordered_quantity: isPostDispatch
          ? order.total_backordered_quantity
          : totalBackorderedQty,
        post_dispatch_edited: isPostDispatch
          ? true
          : order.post_dispatch_edited,
      };

      await manager.getRepository(OrderRevision).save({
        order_id: order.id,
        revision_number: revisionCount + 1,
        old_data: oldData as any,
        new_data: newData as any,
        changed_by_user_id: userId,
        changed_by_role: 'SALESMAN',
        order_status_at_time: order.status_id,
        reason: dto.reason || null,
        distributor_notified: false,
      } as any);

      await manager.getRepository(Order).update(order.id, newData);
      return manager.getRepository(Order).findOne({ where: { id: order.id } });
    });

    await this.auditLogService.logAction(
      'ORDER_EDITED',
      'ORDER',
      savedOrder!.id,
      userId,
      { post_dispatch: isPostDispatch },
    );
    this.socketGateway.broadcastToRoom(
      `distributor:${savedOrder!.distributor_id}`,
      'ORDER_EDITED',
      {
        orderId: savedOrder!.id,
        timestamp: new Date(),
      },
    );

    return savedOrder;
  }

  // ─── cancelOrder ─────────────────────────────────────────────────────────

  async cancelOrder(
    userId: string,
    role: string,
    orderId: string,
    dto: CancelOrderDto,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { status: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const cancelStatus = await this.orderStatusService.getCancelStatus();
    const finalStatus = await this.orderStatusService.getFinalDeliveredStatus();
    const preDispatchStatuses = await this.orderStatusService.getPreDispatchStatuses();

    if (order.status.is_cancel_status)
      throw new BadRequestException('Order already cancelled');
    if (order.status_id === finalStatus.id)
      throw new BadRequestException('Cannot cancel a delivered order');

    // Role-based access control
    if (role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can cancel any order at any status (except already CANCELLED/DELIVERED)
    } else if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman || salesman.id !== order.salesman_id)
        throw new ForbiddenException('Not your order');
      if (!preDispatchStatuses.includes(order.status_id)) {
        throw new BadRequestException(
          'Salesman can only cancel orders before dispatch',
        );
      }
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      if (order.distributor_id !== dist.id)
        throw new ForbiddenException('Not your order');
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    const oldStatusId = order.status_id;

    await this.dataSource.transaction(async (manager) => {
      const items = await manager
        .getRepository(OrderItem)
        .find({ where: { order_id: order.id } });

      // Release inventory
      for (const item of items) {
        if (item.reserved_quantity > 0) {
          await manager.getRepository(DistributorInventory).decrement(
            {
              distributor_id: order.distributor_id,
              product_id: item.product_id,
            },
            'reserved_quantity',
            item.reserved_quantity,
          );
          await manager.getRepository(DistributorInventory).increment(
            {
              distributor_id: order.distributor_id,
              product_id: item.product_id,
            },
            'available_quantity',
            item.reserved_quantity,
          );
          await manager.getRepository(InventoryMovement).save({
            distributor_id: order.distributor_id,
            product_id: item.product_id,
            order_id: order.id,
            movement_type: 'ORDER_CANCELLED',
            quantity_change: item.reserved_quantity,
            changed_by_user_id: userId,
            reason: `Order cancelled: ${dto.cancellationReason}`,
          });
        }
        if (item.backordered_quantity > 0) {
          await manager.getRepository(DistributorInventory).decrement(
            {
              distributor_id: order.distributor_id,
              product_id: item.product_id,
            },
            'backordered_quantity',
            item.backordered_quantity,
          );
          await manager.getRepository(Backorder).update(
            {
              order_id: order.id,
              product_id: item.product_id,
              status: 'OPEN',
            },
            { status: 'CANCELLED' },
          );
        }
        await manager
          .getRepository(OrderItem)
          .update(item.id, { status_id: cancelStatus.id });
      }

      await manager.getRepository(Order).update(order.id, {
        status_id: cancelStatus.id,
        cancelled_at: new Date(),
        cancelled_by_user_id: userId,
        cancellation_reason: dto.cancellationReason,
      });

      await manager.getRepository(OrderStatusHistory).save({
        order_id: order.id,
        old_status_id: oldStatusId,
        new_status_id: cancelStatus.id,
        changed_by_user_id: userId,
        reason: dto.cancellationReason,
      });
    });

    await this.auditLogService.logAction(
      'ORDER_CANCELLED',
      'ORDER',
      order.id,
      userId,
      { reason: dto.cancellationReason },
    );
    this.socketGateway.broadcastToRoom(
      `distributor:${order.distributor_id}`,
      'ORDER_CANCELLED',
      {
        orderId: order.id,
        reason: dto.cancellationReason,
        timestamp: new Date(),
      },
    );
    this.socketGateway.broadcastToRoom(
      `salesman:${order.salesman_id}`,
      'ORDER_CANCELLED',
      {
        orderId: order.id,
        reason: dto.cancellationReason,
        timestamp: new Date(),
      },
    );

    return this.orderRepo.findOne({ where: { id: order.id } });
  }

  // ─── updateOrderStatus ───────────────────────────────────────────────────
  // Phase 3: Full status lifecycle transitions.
  // Roles: SUPER_ADMIN, DISTRIBUTOR_ADMIN (own orders only), MANUFACTURER_ADMIN (ecosystem only).
  // SALESMAN cannot drive status transitions — they use cancel and edit.

  async updateOrderStatus(
    userId: string,
    role: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { status: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Verify ownership (SUPER_ADMIN, DISTRIBUTOR_ADMIN, MANUFACTURER_ADMIN)
    await this.verifyOrderOwnership(order, role, userId);

    // Validate transition
    const nextStatus = await this.orderStatusService.getNextStatus(
      order.status_id,
    );
    if (dto.status_id !== nextStatus.id) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status.name} to the requested status. ` +
          `Allowed: [${nextStatus.name}]`,
      );
    }

    const newStatus = await this.orderStatusService.findOne(dto.status_id);
    const oldStatusId = order.status_id;

    await this.dataSource.transaction(async (manager) => {
      // Inventory: on DISPATCHED, release reserved → deduct from available
      if (newStatus.is_dispatch_status) {
        const items = await manager
          .getRepository(OrderItem)
          .find({ where: { order_id: order.id } });

        for (const item of items) {
          if (item.reserved_quantity > 0) {
            // Release reserved hold
            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: order.distributor_id,
                product_id: item.product_id,
              },
              'reserved_quantity',
              item.reserved_quantity,
            );
            // Deduct from available (stock leaves the warehouse)
            await manager.getRepository(DistributorInventory).decrement(
              {
                distributor_id: order.distributor_id,
                product_id: item.product_id,
              },
              'available_quantity',
              item.reserved_quantity,
            );
            await manager.getRepository(InventoryMovement).save({
              distributor_id: order.distributor_id,
              product_id: item.product_id,
              order_id: order.id,
              movement_type: 'ORDER_DISPATCHED',
              quantity_change: item.reserved_quantity,
              changed_by_user_id: userId,
              reason: `Order dispatched: ${order.order_number}`,
            });
          }
          // Update dispatched_quantity on item
          await manager
            .getRepository(OrderItem)
            .update(item.id, {
              dispatched_quantity: item.reserved_quantity,
              status_id: newStatus.id,
            });
        }
      }

      // Inventory: on DELIVERED, update delivered_quantity on items
      const finalStatus = await this.orderStatusService.getFinalDeliveredStatus();
      if (newStatus.id === finalStatus.id) {
        const items = await manager
          .getRepository(OrderItem)
          .find({ where: { order_id: order.id } });
        for (const item of items) {
          await manager
            .getRepository(OrderItem)
            .update(item.id, {
              delivered_quantity: item.dispatched_quantity,
              status_id: newStatus.id,
            });
        }
      }

      // Update order status
      await manager.getRepository(Order).update(order.id, {
        status_id: newStatus.id,
      });

      // OrderStatusHistory record
      await manager.getRepository(OrderStatusHistory).save({
        order_id: order.id,
        old_status_id: oldStatusId,
        new_status_id: newStatus.id,
        changed_by_user_id: userId,
        reason: dto.notes || undefined,
      });

      // FulfillmentLog record
      await manager.getRepository(FulfillmentLog).save({
        order_id: order.id,
        distributor_id: order.distributor_id,
        action: newStatus.name,
        old_status: order.status.name,
        new_status: newStatus.name,
        performed_by_user_id: userId,
        notes: dto.notes || undefined,
      });
    });

    await this.auditLogService.logAction(
      'ORDER_STATUS_UPDATED',
      'ORDER',
      order.id,
      userId,
      { from: oldStatusId, to: newStatus.id },
    );

    // Emit websocket events per status
    const socketEvent = `ORDER_${newStatus.name}`;
    this.socketGateway.broadcastToRoom(
      `distributor:${order.distributor_id}`,
      socketEvent,
      {
        orderId: order.id,
        orderNumber: order.order_number,
        from: oldStatusId,
        to: newStatus.id,
        timestamp: new Date(),
      },
    );
    this.socketGateway.broadcastToRoom(
      `salesman:${order.salesman_id}`,
      socketEvent,
      {
        orderId: order.id,
        orderNumber: order.order_number,
        from: oldStatusId,
        to: newStatus.id,
        timestamp: new Date(),
      },
    );

    // Re-fetch with relations for consistent response
    return this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('order.distributor', 'distributor')
      .where('order.id = :orderId', { orderId: order.id })
      .getOne();
  }

  // ─── getOrders ────────────────────────────────────────────────────────────
  // Phase 4: Expanded search. Phase 5: Typed OrderListQueryDto (no `as any`).

  async getOrders(
    userId: string,
    role: string,
    queryDto: OrderListQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      status,
      salesman_id,
      shop_id,
      startDate,
      endDate,
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('order.distributor', 'distributor');

    if (role === 'SUPER_ADMIN') {
      // No restriction — sees all orders globally
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      qb.andWhere('order.distributor_id = :distId', { distId: dist.id });
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      const links = await this.mfrDistRepo.find({
        where: { manufacturer_id: mfr.id },
      });
      const distIds = links.map((l) => l.distributor_id);
      if (distIds.length === 0) {
        return {
          data: [],
          meta: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }
      qb.andWhere('order.distributor_id IN (:...distIds)', { distIds });
    } else if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman) throw new ForbiddenException('Salesman not found');
      qb.andWhere('order.salesman_id = :salesmanId', {
        salesmanId: salesman.id,
      });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    // Phase 4: Multi-field search via joins (no N+1 — joins already done above)
    if (search) {
      qb.andWhere(
        '(order.order_number ILIKE :search ' +
          'OR shop.name ILIKE :search ' +
          'OR salesman.full_name ILIKE :search ' +
          'OR distributor.business_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Phase 5: Validated typed filters (no `as any`)
    if (status)
      qb.andWhere('order.status_id = :status', { status });
    if (salesman_id)
      qb.andWhere('order.salesman_id = :sId', { sId: salesman_id });
    if (shop_id)
      qb.andWhere('order.shop_id = :shId', { shId: shop_id });
    if (startDate)
      qb.andWhere('order.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('order.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = [
      'created_at',
      'updated_at',
      'final_order_amount',
      'order_number',
    ];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`order.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('order.created_at', 'DESC');
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

  // ─── getOrderById ─────────────────────────────────────────────────────────
  // Phase 2: Now includes order_items via leftJoinAndSelect (no N+1 queries).

  async getOrderById(userId: string, role: string, orderId: string) {
    const order = await this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('order.distributor', 'distributor')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.id = :orderId', { orderId })
      .getOne();
    if (!order) throw new NotFoundException('Order not found');
    await this.verifyOrderOwnership(order, role, userId);
    return order;
  }

  // ─── getOrderRevisions ────────────────────────────────────────────────────
  // Phase 6: Paginated revision history.

  async getOrderRevisions(
    userId: string,
    role: string,
    orderId: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<OrderRevision>> {
    const { page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.verifyOrderOwnership(order, role, userId);

    const [data, total] = await this.revisionRepo.findAndCount({
      where: { order_id: orderId },
      relations: { changed_by_user: true },
      order: { revision_number: 'ASC' },
      skip,
      take: limit,
    });

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

  // ─── getOrderStatusHistory ────────────────────────────────────────────────
  // New: Paginated status history endpoint.

  async getOrderStatusHistory(
    userId: string,
    role: string,
    orderId: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<OrderStatusHistory>> {
    const { page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.verifyOrderOwnership(order, role, userId);

    const [data, total] = await this.statusHistoryRepo.findAndCount({
      where: { order_id: orderId },
      relations: { changed_by_user: true },
      order: { created_at: 'ASC' },
      skip,
      take: limit,
    });

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

  // ─── Query Builder for Exports ───────────────────────────────────────────

  private async buildOrdersQuery(userId: string, role: string, queryDto: OrderListQueryDto) {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('order.distributor', 'distributor');

    if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      qb.andWhere('order.distributor_id = :distId', { distId: dist.id });
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (mfr) {
        const links = await this.mfrDistRepo.find({ where: { manufacturer_id: mfr.id } });
        const distIds = links.map((l) => l.distributor_id);
        if (distIds.length > 0) {
          qb.andWhere('order.distributor_id IN (:...distIds)', { distIds });
        } else {
          qb.andWhere('1 = 0');
        }
      } else {
        qb.andWhere('1 = 0');
      }
    } else if (role === 'SALESMAN') {
      const salesman = await this.getSalesmanOrFail(userId);
      qb.andWhere('order.salesman_id = :smId', { smId: salesman.id });
    }

    if (queryDto.status) {
      qb.andWhere('order.status_id = :status', { status: queryDto.status });
    }
    if (queryDto.salesman_id) {
      qb.andWhere('order.salesman_id = :salesman_id', { salesman_id: queryDto.salesman_id });
    }
    if (queryDto.shop_id) {
      qb.andWhere('order.shop_id = :shop_id', { shop_id: queryDto.shop_id });
    }
    if (queryDto.startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate: queryDto.startDate });
    }
    if (queryDto.endDate) {
      qb.andWhere('order.created_at <= :endDate', { endDate: queryDto.endDate });
    }
    if (queryDto.search) {
      qb.andWhere(
        '(order.order_number ILIKE :search OR shop.shop_name ILIKE :search OR distributor.business_name ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }
    
    qb.orderBy('order.created_at', 'DESC');
    return qb;
  }

  // ─── Exports ─────────────────────────────────────────────────────────────

  async exportOrdersCsv(
    userId: string,
    role: string,
    query: OrderListQueryDto,
  ): Promise<stream.PassThrough> {
    const qb = await this.buildOrdersQuery(userId, role, query);
    qb.leftJoinAndSelect('order.status', 'status');
    qb.take(10000);

    const orders = await qb.getMany();
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Shop Name', key: 'shop_name', width: 25 },
      { header: 'Salesman Name', key: 'salesman_name', width: 25 },
      { header: 'Distributor Name', key: 'distributor_name', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Final Amount', key: 'final_amount', width: 15 },
      { header: 'Created Date', key: 'created_at', width: 20 },
    ];

    orders.forEach(o => {
      sheet.addRow({
        order_number: o.order_number,
        shop_name: o.shop?.name,
        salesman_name: o.salesman?.full_name,
        distributor_name: o.distributor?.business_name,
        status: o.status?.name,
        final_amount: o.final_order_amount,
        created_at: o.created_at.toISOString(),
      });
    });

    const passThrough = new stream.PassThrough();
    workbook.csv.write(passThrough).catch(() => {});
    return passThrough;
  }

  async exportOrdersXlsx(
    userId: string,
    role: string,
    query: OrderListQueryDto,
  ): Promise<stream.PassThrough> {
    const qb = await this.buildOrdersQuery(userId, role, query);
    qb.leftJoinAndSelect('order.status', 'status');
    qb.take(10000);

    const orders = await qb.getMany();
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Shop Name', key: 'shop_name', width: 25 },
      { header: 'Salesman Name', key: 'salesman_name', width: 25 },
      { header: 'Distributor Name', key: 'distributor_name', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Final Amount', key: 'final_amount', width: 15 },
      { header: 'Created Date', key: 'created_at', width: 20 },
    ];

    orders.forEach(o => {
      sheet.addRow({
        order_number: o.order_number,
        shop_name: o.shop?.name,
        salesman_name: o.salesman?.full_name,
        distributor_name: o.distributor?.business_name,
        status: o.status?.name,
        final_amount: o.final_order_amount,
        created_at: o.created_at.toISOString(),
      });
    });

    const passThrough = new stream.PassThrough();
    workbook.xlsx.write(passThrough).catch(() => {});
    return passThrough;
  }

  // ─── Backorders ──────────────────────────────────────────────────────────

  async getBackorders(
    userId: string,
    role: string,
    query: BackorderListQueryDto,
  ): Promise<PaginatedResponse<Backorder>> {
    const { page = 1, limit = 20, search, status, distributor_id, salesman_id } = query;
    const skip = (page - 1) * limit;

    const qb = this.backorderRepo
      .createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.product', 'product')
      .leftJoinAndSelect('backorder.distributor', 'distributor')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .orderBy('backorder.created_at', 'DESC');

    // Role filtering
    if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (!dist) throw new ForbiddenException();
      qb.andWhere('backorder.distributor_id = :distId', { distId: dist.id });
    } else if (role === 'SALESMAN') {
      const sm = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      if (!sm) throw new ForbiddenException();
      qb.andWhere('order.salesman_id = :smId', { smId: sm.id });
    } else if (role === 'MANUFACTURER_ADMIN') {
      const userDistributors = await this.mfrDistRepo
        .createQueryBuilder('md')
        .innerJoin('md.manufacturer', 'm')
        .where('m.user_id = :userId', { userId })
        .getMany();
      const distIds = userDistributors.map((md) => md.distributor_id);
      if (distIds.length === 0) {
        qb.andWhere('1 = 0');
      } else {
        qb.andWhere('backorder.distributor_id IN (:...distIds)', { distIds });
      }
    }

    if (status) {
      qb.andWhere('backorder.status = :status', { status });
    }
    if (distributor_id) {
      qb.andWhere('backorder.distributor_id = :distributor_id', { distributor_id });
    }
    if (salesman_id) {
      qb.andWhere('order.salesman_id = :salesman_id', { salesman_id });
    }
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR distributor.business_name ILIKE :search OR salesman.full_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getBackorderById(
    userId: string,
    role: string,
    id: string,
  ): Promise<Backorder> {
    const qb = this.backorderRepo
      .createQueryBuilder('backorder')
      .leftJoinAndSelect('backorder.product', 'product')
      .leftJoinAndSelect('backorder.distributor', 'distributor')
      .leftJoinAndSelect('backorder.order', 'order')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .where('backorder.id = :id', { id });

    // Role filtering
    if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      qb.andWhere('backorder.distributor_id = :distId', { distId: dist?.id });
    } else if (role === 'SALESMAN') {
      const sm = await this.salesmanRepo.findOne({ where: { user_id: userId } });
      qb.andWhere('order.salesman_id = :smId', { smId: sm?.id });
    }

    const backorder = await qb.getOne();
    if (!backorder) throw new NotFoundException('Backorder not found or access denied');
    return backorder;
  }

  async resolveBackorder(
    userId: string,
    role: string,
    id: string,
    dto: ResolveBackorderDto,
  ): Promise<Backorder> {
    if (role !== 'SUPER_ADMIN' && role !== 'DISTRIBUTOR_ADMIN') {
      throw new ForbiddenException();
    }
    const backorder = await this.getBackorderById(userId, role, id);
    if (backorder.status === 'RESOLVED' || backorder.status === 'CANCELLED') {
      throw new BadRequestException('Backorder is already resolved or cancelled');
    }

    const newResolved = Number(backorder.resolved_quantity) + dto.resolved_quantity;
    if (newResolved > backorder.quantity) {
      throw new BadRequestException('Resolved quantity cannot exceed backorder quantity');
    }

    backorder.resolved_quantity = newResolved;
    backorder.status = newResolved === Number(backorder.quantity) ? 'RESOLVED' : 'PARTIALLY_ALLOCATED';

    await this.backorderRepo.save(backorder);
    return this.getBackorderById(userId, role, id);
  }

  // ─── Fulfillment Logs ──────────────────────────────────────────────────────
  
  async getFulfillmentLogs(
    userId: string,
    role: string,
    orderId: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<FulfillmentLog>> {
    // Basic access check
    await this.getOrderById(userId, role, orderId);

    const { page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.fulfillmentLogRepo.findAndCount({
      where: { order_id: orderId },
      relations: { performed_by_user: true, distributor: true },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
