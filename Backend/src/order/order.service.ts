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

const ORDER_STATUSES = [
  'CREATED',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
];
const PRE_DISPATCH_STATUSES = ['CREATED', 'CONFIRMED', 'PROCESSING', 'PACKED'];

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

          grossOrderAmount += netLineAmount; // Sum of net line amounts
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
            status:
              backorderQty > 0 && reservable === 0 ? 'BACKORDERED' : 'RESERVED',
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
          status: 'CREATED',
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
            // Update inventory record
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

            // Inventory movement — reserved
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

            // Inventory movement + backorder record
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
          old_status: '',
          new_status: 'CREATED',
          changed_by_user_id: userId,
        });

        return {
          savedOrder: savedOrderRec,
          createdBackorders: createdBackordersArray,
        };
      },
    );

    // Audit + Socket (outside transaction)
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

  async updateOrder(userId: string, orderId: string, dto: UpdateOrderDto) {
    const salesman = await this.getSalesmanOrFail(userId);
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.salesman_id !== salesman.id)
      throw new ForbiddenException('Not your order');
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new BadRequestException(
        'Cannot edit a cancelled or delivered order',
      );
    }

    const isPostDispatch = !PRE_DISPATCH_STATUSES.includes(order.status);
    const oldData = { ...order };

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
                order_item_id: null, // will be updated after item save
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
          status:
            backorderQty > 0 && reservable === 0 ? 'BACKORDERED' : 'RESERVED',
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

      // Revision count
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
        order_status_at_time: order.status,
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
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED')
      throw new BadRequestException('Order already cancelled');
    if (order.status === 'DELIVERED')
      throw new BadRequestException('Cannot cancel a delivered order');

    // Salesman: only pre-dispatch
    if (role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: userId },
      });
      if (!salesman || salesman.id !== order.salesman_id)
        throw new ForbiddenException('Not your order');
      if (!PRE_DISPATCH_STATUSES.includes(order.status)) {
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

    const oldStatus = order.status;

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
          .update(item.id, { status: 'CANCELLED' });
      }

      await manager.getRepository(Order).update(order.id, {
        status: 'CANCELLED',
        cancelled_at: new Date(),
        cancelled_by_user_id: userId,
        cancellation_reason: dto.cancellationReason,
      });

      await manager.getRepository(OrderStatusHistory).save({
        order_id: order.id,
        old_status: oldStatus,
        new_status: 'CANCELLED',
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

  // ─── Fulfillment transitions ──────────────────────────────────────────────

  // ─── getOrders ────────────────────────────────────────────────────────────

  async getOrders(
    userId: string,
    role: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<Order>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      ...filters
    } = queryDto as any;
    const skip = (page - 1) * limit;

    const qb = this.orderRepo.createQueryBuilder('order');

    if (role === 'SUPER_ADMIN') {
      // no-op, sees all
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

    if (search) {
      qb.andWhere('order.order_number ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (filters.status)
      qb.andWhere('order.status = :status', { status: filters.status });
    if (filters.salesman_id)
      qb.andWhere('order.salesman_id = :sId', { sId: filters.salesman_id });
    if (filters.shop_id)
      qb.andWhere('order.shop_id = :shId', { shId: filters.shop_id });

    if (filters.startDate)
      qb.andWhere('order.created_at >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    if (filters.endDate)
      qb.andWhere('order.created_at <= :endDate', {
        endDate: new Date(filters.endDate),
      });

    const allowedSortFields = [
      'created_at',
      'updated_at',
      'total_amount',
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

  async getOrderById(userId: string, role: string, orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.verifyOrderOwnership(order, role, userId);
    return order;
  }

  // ─── getOrderRevisions ────────────────────────────────────────────────────

  async getOrderRevisions(userId: string, role: string, orderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    await this.verifyOrderOwnership(order, role, userId);
    return this.revisionRepo.find({
      where: { order_id: orderId },
      order: { revision_number: 'ASC' },
    });
  }
}
