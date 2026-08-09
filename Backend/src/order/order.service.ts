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
import { CreateOrderDto, CreateDistributorManufacturerOrderDto } from './dto/create-order.dto';
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
      if (order.manufacturer_id !== mfr.id)
        throw new ForbiddenException('Not your order');
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

  // ─── generatePurchaseRequest ──────────────────────────────────────────────
  async generatePurchaseRequest(userId: string) {
    const distributor = await this.getDistributorOrFail(userId);
    const draftStatus = await this.orderStatusService.getStatusByName('DRAFT');
    if (!draftStatus) {
      throw new Error('DRAFT status not found in database');
    }

    const finalStatus = await this.orderStatusService.getFinalDeliveredStatus();

    // 1. Inspect all pending salesman orders for this distributor
    // Pending means orders not yet delivered (and not cancelled)
    // In our model, this means we exclude the final delivery status and cancellation statuses.
    // We also only care about orders created by a salesman (salesman_id IS NOT NULL)
    
    // We will aggregate demand by product_id
    const demandQuery = await this.orderRepo
      .createQueryBuilder('order')
      .innerJoin('order.status', 'status')
      .innerJoin('order.items', 'item')
      .select('item.product_id', 'product_id')
      .addSelect('SUM(item.quantity)', 'outstanding_demand') // Dispatched items shouldn't be subtracted since they haven't been deducted from inventory yet
      .where('order.distributor_id = :distributorId', { distributorId: distributor.id })
      .andWhere('order.salesman_id IS NOT NULL')
      .andWhere('order.status_id != :finalStatusId', { finalStatusId: finalStatus.id })
      .andWhere('status.is_cancel_status = false')
      .groupBy('item.product_id')
      .getRawMany();

    const requiredQuantities: { productId: string; requiredQuantity: number }[] = [];

    for (const row of demandQuery) {
      const productId = row.product_id;
      const outstandingDemand = Number(row.outstanding_demand) || 0;

      // 2. Fetch current distributor inventory
      const inv = await this.dataSource.getRepository('DistributorInventory').findOne({
        where: { distributor_id: distributor.id, product_id: productId },
      });
      const availableQty = inv ? Number((inv as any).available_quantity) : 0;

      // 3. Calculate Required = Demand - Inventory (Never negative)
      const required = Math.max(0, outstandingDemand - availableQty);
      if (required > 0) {
        requiredQuantities.push({ productId, requiredQuantity: required });
      }
    }

    // 4. Return Simulated Order Data instead of creating it
    let grossOrderAmount = 0;
    let totalQuantity = 0;
    const itemsData: any[] = [];

    for (const req of requiredQuantities) {
      const product = await this.productRepo.findOne({ where: { id: req.productId } });
      if (!product) continue;

      const lineAmount = Number(product.mrp) * req.requiredQuantity;
      grossOrderAmount += lineAmount;
      totalQuantity += req.requiredQuantity;

      itemsData.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        sku_snapshot: (product as any).sku || null,
        manufacturer_name_snapshot: (product as any).manufacturer_name || null,
        quantity: req.requiredQuantity,
        mrp: Number(product.mrp),
        gross_line_amount: lineAmount,
        net_line_amount: lineAmount,
      });
    }

    return { 
      data: {
        items: itemsData,
        gross_order_amount: grossOrderAmount,
        total_quantity: totalQuantity,
      },
      message: 'Purchase request items calculated successfully'
    };
  }

  // ─── createDistributorManufacturerOrder ──────────────────────────────────
  async createDistributorManufacturerOrder(userId: string, dto: CreateDistributorManufacturerOrderDto) {
    const distributor = await this.getDistributorOrFail(userId);
    
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException('At least one product is required');
    }

    const draftStatus = await this.orderStatusService.getStatusByName('DRAFT');
    if (!draftStatus) throw new Error('DRAFT status not found in database');

    const savedOrders = await this.dataSource.transaction(
      async (manager) => {
        const groupedProducts = new Map<string | null, any[]>();
        
        for (let i = 0; i < dto.products.length; i++) {
          const p = dto.products[i];
          const product = await this.productRepo.findOne({
            where: { id: p.productId },
          });
          if (!product)
            throw new NotFoundException(`Product ${p.productId} not found`);

          const mfrId = product.manufacturer_id || null;
          if (!groupedProducts.has(mfrId)) {
            groupedProducts.set(mfrId, []);
          }
          groupedProducts.get(mfrId)!.push({ p, product });
        }

        const createdOrders: Order[] = [];

        for (const [mfrId, items] of groupedProducts.entries()) {
          if (mfrId) {
             const manufacturer = await manager.getRepository('Manufacturer').findOne({
                where: { id: mfrId, is_active: true },
             });
             if (!manufacturer) {
                throw new BadRequestException(`Invalid or inactive manufacturer ${mfrId}`);
             }
          }

          let grossOrderAmount = 0;
          let totalProductDiscountAmount = 0;
          let totalQuantity = 0;
          const itemsData: Partial<OrderItem>[] = [];

          for (const item of items) {
            const { p, product } = item;
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

            itemsData.push({
              product_id: p.productId,
              product_name_snapshot: product.name,
              sku_snapshot: (product as any).sku || null,
              manufacturer_name_snapshot:
                (product as any).manufacturer_name || null,
              quantity: Number(p.quantity),
              mrp: Number(product.mrp),
              gross_line_amount: grossLineAmount,
              net_line_amount: netLineAmount,
              reserved_quantity: 0,
              backordered_quantity: 0,
              dispatched_quantity: 0,
              delivered_quantity: 0,
              status_id: draftStatus.id,
            });
          }

          const standardDiscountPercent = 0;
          const specDiscountPercent = 0;

          const standardDiscountAmount = 0;
          const specialDiscountAmount = 0;

          const finalOrderAmount = grossOrderAmount;

          const idempotencyKey = dto.idempotencyKey ? `${dto.idempotencyKey}-${mfrId || 'self'}` : undefined;
          
          if (idempotencyKey) {
            const existing = await manager.getRepository(Order).findOne({
              where: { idempotency_key: idempotencyKey },
              relations: { items: true },
            });
            if (existing) {
              createdOrders.push(existing);
              continue;
            }
          }

          const order = manager.getRepository(Order).create({
            order_number: this.generateOrderNumber(),
            visit_id: null as any,
            shop_id: null as any,
            salesman_id: null as any,
            distributor_id: distributor.id,
            manufacturer_id: mfrId as any,
            status_id: draftStatus.id,
            gross_order_amount: grossOrderAmount,
            standard_discount_percent: standardDiscountPercent,
            standard_discount_amount: standardDiscountAmount,
            special_discount_percent: specDiscountPercent,
            special_discount_amount: specialDiscountAmount,
            transport_mode: dto.transportMode,
            final_order_amount: finalOrderAmount,
            total_quantity: totalQuantity,
            total_backordered_quantity: 0,
            is_offline_created: false,
            idempotency_key: idempotencyKey,
          });

          const saved = await manager.getRepository(Order).save(order);

          for (const itemData of itemsData) {
            itemData.order_id = saved.id;
            await manager.getRepository(OrderItem).save(itemData);
          }

          const fullOrder = await manager.getRepository(Order).findOne({
            where: { id: saved.id },
            relations: { items: true },
          });

          if (fullOrder) {
            createdOrders.push(fullOrder);
          }
        }

        return createdOrders;
      },
    );

    return savedOrders;
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

    const savedOrder = await this.dataSource.transaction(
      async (manager) => {
        let grossOrderAmount = 0;
        let totalProductDiscountAmount = 0;
        let totalQuantity = 0;
        const itemsData: Partial<OrderItem>[] = [];

        for (let i = 0; i < dto.products.length; i++) {
          const p = dto.products[i];
          const product = await this.productRepo.findOne({
            where: { id: p.productId },
          });
          if (!product)
            throw new NotFoundException(`Product ${p.productId} not found`);

          const grossLineAmount = Number(product.mrp) * Number(p.quantity);
          const netLineAmount = grossLineAmount;

          grossOrderAmount += netLineAmount;
          totalProductDiscountAmount += 0;
          totalQuantity += Number(p.quantity);

          itemsData.push({
            product_id: p.productId,
            product_name_snapshot: product.name,
            sku_snapshot: (product as any).sku || null,
            manufacturer_name_snapshot:
              (product as any).manufacturer_name || null,
            quantity: Number(p.quantity),
            mrp: Number(product.mrp),
            gross_line_amount: grossLineAmount,
            net_line_amount: netLineAmount,
            reserved_quantity: 0,
            backordered_quantity: 0,
            dispatched_quantity: 0,
            delivered_quantity: 0,
            status_id: initialStatus.id,
          });
        }

        const standardDiscountPercent = dto.standardDiscountPercent || 0;
        const specDiscountPercent = dto.specialDiscountPercent || 0;

        const standardDiscountAmount = (standardDiscountPercent / 100) * grossOrderAmount;
        const afterDistDiscount = grossOrderAmount - standardDiscountAmount;
        const specialDiscountAmount = (specDiscountPercent / 100) * afterDistDiscount;

        const finalOrderAmount = grossOrderAmount - standardDiscountAmount - specialDiscountAmount;

        // Create order
        const order = manager.getRepository(Order).create({
          order_number: this.generateOrderNumber(),
          visit_id: visit.id,
          shop_id: shop.id,
          salesman_id: salesman.id,
          distributor_id: salesman.distributor_id,
          status_id: initialStatus.id,
          gross_order_amount: grossOrderAmount,
          standard_discount_percent: standardDiscountPercent,
          standard_discount_amount: standardDiscountAmount,
          special_discount_percent: specDiscountPercent,
          special_discount_amount: specialDiscountAmount,
          transport_mode: dto.transportMode,
          final_order_amount: finalOrderAmount,
          total_quantity: totalQuantity,
          total_backordered_quantity: 0,
          is_offline_created: dto.isOfflineCreated || false,
          idempotency_key: dto.idempotencyKey || undefined,
        });
        const savedOrderRec = await manager.getRepository(Order).save(order);

        // Save items
        for (let i = 0; i < itemsData.length; i++) {
          itemsData[i].order_id = savedOrderRec.id;
          await manager.getRepository(OrderItem).save(itemsData[i]);
        }

        // Status history
        await manager.getRepository(OrderStatusHistory).save({
          order_id: savedOrderRec.id,
          old_status_id: undefined,
          new_status_id: initialStatus.id,
          changed_by_user_id: userId,
        });

        return savedOrderRec;
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

    return savedOrder;
  }

  // ─── updateOrder ─────────────────────────────────────────────────────────
  // Architecture Decision: Only SALESMAN role can edit orders.
  // Editing requires the original salesman's context for inventory re-allocation.
  // SUPER_ADMIN is removed from @Roles() in the controller.

  async updateOrder(userId: string, role: string, orderId: string, dto: UpdateOrderDto) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { status: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (role === 'SALESMAN') {
      const salesman = await this.getSalesmanOrFail(userId);
      if (order.salesman_id !== salesman.id)
        throw new ForbiddenException('Not your order');
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      if (order.distributor_id !== dist.id)
        throw new ForbiddenException('Not your order');
      if (order.status.name !== 'DRAFT')
        throw new BadRequestException('Distributors can only edit DRAFT orders.');
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      if (order.manufacturer_id !== mfr.id)
        throw new ForbiddenException('Not your order');
      if (order.status.name !== 'DRAFT')
        throw new BadRequestException('Manufacturers can only edit DRAFT orders.');
    } else {
      throw new ForbiddenException('Unauthorized role for editing orders');
    }
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
        const discountType = 'NONE';
        const discountValue = 0;
        const itemDiscountAmount = 0;
        const netLineAmount = grossLineAmount;

        grossOrderAmount += netLineAmount;
        totalProductDiscountAmount += itemDiscountAmount;
        totalQuantity += Number(p.quantity);
      }

      let standardDiscountPercent: number;
      let specialDiscountPercent: number;

      if (role === 'DISTRIBUTOR_ADMIN' && order.salesman_id === null) {
        // Distributors cannot add or edit discounts on purchase orders (order to manufacturer)
        standardDiscountPercent = Number(order.standard_discount_percent || 0);
        specialDiscountPercent = Number(order.special_discount_percent || 0);
      } else {
        standardDiscountPercent = dto.standardDiscountPercent !== undefined
          ? Number(dto.standardDiscountPercent)
          : Number(order.standard_discount_percent || 0);
        specialDiscountPercent = dto.specialDiscountPercent !== undefined
          ? Number(dto.specialDiscountPercent)
          : Number(order.special_discount_percent || 0);
      }

      const standardDiscountAmount = grossOrderAmount * (standardDiscountPercent / 100);
      const afterDistDiscount = grossOrderAmount - standardDiscountAmount;
      const specialDiscountAmount = afterDistDiscount * (specialDiscountPercent / 100);
      const totalOrderDiscount = standardDiscountAmount + specialDiscountAmount;

      let totalGstAmount = 0;

      // Save items and calculate GST per item prorated
      for (const p of dto.products) {
        const product = await this.productRepo.findOne({
          where: { id: p.productId },
        });
        if (!product)
          throw new NotFoundException(`Product ${p.productId} not found`);

        const grossLineAmount = Number(product.mrp) * Number(p.quantity);
        const discountType = 'NONE';
        const discountValue = 0;
        const itemDiscountAmount = 0;
        const netLineAmount = grossLineAmount;

        // Prorate order-level discount to this item for GST calculation
        const itemProportion = grossOrderAmount > 0 ? netLineAmount / grossOrderAmount : 0;
        const itemOrderDiscount = itemProportion * (standardDiscountAmount + specialDiscountAmount);
        const itemTaxableAmount = netLineAmount - itemOrderDiscount;
        
        const gstPercent = Number(product.gst_percent) || 0;
        const gstAmount = itemTaxableAmount * (gstPercent / 100);
        totalGstAmount += gstAmount;

        await manager.getRepository(OrderItem).save({
          order_id: order.id,
          product_id: p.productId,
          product_name_snapshot: product.name,
          quantity: Number(p.quantity),
          mrp: Number(product.mrp),
          gross_line_amount: grossLineAmount,
          net_line_amount: netLineAmount,
          gst_percent_snapshot: gstPercent,
          gst_amount: gstAmount,
          reserved_quantity: 0,
          backordered_quantity: 0,
          dispatched_quantity: 0,
          delivered_quantity: 0,
          status_id: initialStatus.id,
        });
      }

      const finalOrderAmount = grossOrderAmount - totalOrderDiscount + totalGstAmount;

      const revisionCount = await manager
        .getRepository(OrderRevision)
        .count({ where: { order_id: order.id } });

      const newData: any = {
        gross_order_amount: grossOrderAmount,
        standard_discount_percent: standardDiscountPercent,
        standard_discount_amount: standardDiscountAmount,
        special_discount_percent: specialDiscountPercent,
        special_discount_amount: specialDiscountAmount,
        total_gst_amount: totalGstAmount,
        final_order_amount: finalOrderAmount,
        total_quantity: totalQuantity,
        total_backordered_quantity: isPostDispatch
          ? order.total_backordered_quantity
          : 0,
        post_dispatch_edited: isPostDispatch
          ? true
          : order.post_dispatch_edited,
      };

      if (dto.transportMode !== undefined) {
        newData.transport_mode = dto.transportMode;
      }

      if (dto.manufacturerId !== undefined) {
        newData.manufacturer_id = dto.manufacturerId;
      }

      await manager.getRepository(OrderRevision).save({
        order_id: order.id,
        revision_number: revisionCount + 1,
        old_data: oldData as any,
        new_data: newData,
        changed_by_user_id: userId,
        changed_by_role: role,
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
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      if (order.manufacturer_id !== mfr.id)
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
            reason: `Legacy reservation released on cancellation: ${dto.cancellationReason}`,
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

        // No inventory to return, because inventory is only deducted at the final status now.
        // We do not need to increment or return stock here.

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

    // The person who created the order (buyer) cannot update its status.
    // For distributor-to-manufacturer orders, the creator is the DISTRIBUTOR_ADMIN.
    if (role === 'DISTRIBUTOR_ADMIN' && order.salesman_id === null) {
      throw new ForbiddenException('The creator of the order cannot update its status.');
    }

    let targetStatusId = dto.status_id;
    if (!targetStatusId && dto.status) {
      const statusObj = await this.orderStatusService.getStatusByName(dto.status);
      if (!statusObj) throw new BadRequestException(`Status ${dto.status} not found`);
      targetStatusId = statusObj.id;
    }

    if (!targetStatusId) {
      throw new BadRequestException('Status or Status ID is required');
    }

    // Validate transition
    const nextStatus = await this.orderStatusService.getNextStatus(
      order.status_id,
    );
    if (targetStatusId !== nextStatus.id) {
      throw new BadRequestException(
        `Cannot transition order from ${order.status.name} to the requested status. ` +
          `Allowed: [${nextStatus.name}]`,
      );
    }

    if (order.salesman_id === null && !order.manufacturer_id) {
      throw new BadRequestException('Manufacturer ID is required before placing a Distributor to Manufacturer order');
    }

    const newStatus = await this.orderStatusService.findOne(targetStatusId);
    const oldStatusId = order.status_id;

    await this.dataSource.transaction(async (manager) => {
      const items = await manager
        .getRepository(OrderItem)
        .find({ where: { order_id: order.id } });

      const finalStatus = await this.orderStatusService.getFinalDeliveredStatus();
      const isAlreadyDispatched = order.status.is_dispatch_status || order.status_id === finalStatus.id;

      // 0. Preemptive Inventory Validation for all non-cancel status updates
      if (!newStatus.is_cancel_status) {
        const isDistributorToManufacturer = order.salesman_id === null;
        for (const item of items) {
          const qty = item.dispatched_quantity > 0 ? item.dispatched_quantity : item.quantity;
          if (isDistributorToManufacturer) {
            const mfrInv = await manager.getRepository('ManufacturerInventory').findOne({
              where: { manufacturer_id: order.manufacturer_id, product_id: item.product_id },
            });
            const mfrAvailableQty = mfrInv ? Number((mfrInv as any).available_quantity) : 0;
            if (mfrAvailableQty < qty) {
              throw new BadRequestException(
                `Insufficient manufacturer inventory for product ${item.product_name_snapshot}. Required: ${qty}, Available: ${mfrAvailableQty}. Order remains in current status.`
              );
            }
          } else {
            const distInv = await manager.getRepository(DistributorInventory).findOne({
              where: { distributor_id: order.distributor_id, product_id: item.product_id },
            });
            const distAvailableQty = distInv ? Number(distInv.available_quantity) : 0;
            if (distAvailableQty < qty) {
              throw new BadRequestException(
                `Insufficient inventory for product ${item.product_name_snapshot}. Required: ${qty}, Available: ${distAvailableQty}. Order remains in current status.`
              );
            }
          }
        }
      }

      // 1. Pre-Final Status Item Updates (No inventory control)
      if (!newStatus.is_cancel_status && newStatus.id !== finalStatus.id) {
        for (const item of items) {
          if (newStatus.is_dispatch_status) {
            await manager.getRepository(OrderItem).update(item.id, {
              dispatched_quantity: item.quantity,
              status_id: newStatus.id,
            });
          } else {
             await manager.getRepository(OrderItem).update(item.id, {
               status_id: newStatus.id,
             });
          }
        }
      }

      // 2. Inventory Validation & Update at Final Status (DELIVERED)
      if (newStatus.id === finalStatus.id) {
        const isDistributorToManufacturer = order.salesman_id === null;
        for (const item of items) {
          const qty = item.dispatched_quantity > 0 ? item.dispatched_quantity : item.quantity;
          await manager
            .getRepository(OrderItem)
            .update(item.id, {
              delivered_quantity: qty,
              status_id: newStatus.id,
            });
            
          if (isDistributorToManufacturer) {
            // Decrement ManufacturerInventory
            const mfrInv = await manager.getRepository('ManufacturerInventory').findOne({
              where: { manufacturer_id: order.manufacturer_id, product_id: item.product_id },
              lock: { mode: 'pessimistic_write' },
            });
            const mfrAvailableQty = mfrInv ? Number((mfrInv as any).available_quantity) : 0;
            if (mfrAvailableQty < qty) {
              throw new BadRequestException(
                `Insufficient manufacturer inventory for product ${item.product_name_snapshot}. Required: ${qty}, Available: ${mfrAvailableQty}. Order remains in current status.`
              );
            }
            await manager.getRepository('ManufacturerInventory').decrement(
              { id: (mfrInv as any).id },
              'available_quantity',
              qty,
            );
            await manager.getRepository('ManufacturerInventoryMovement').save({
              manufacturer_id: order.manufacturer_id,
              product_id: item.product_id,
              order_id: order.id,
              movement_type: 'ORDER_DELIVERED',
              quantity_change: qty,
              changed_by_user_id: userId,
              reason: `Order delivered: ${order.order_number}`,
            });

            // Increase DistributorInventory
            let distInv = await manager.getRepository(DistributorInventory).findOne({
              where: { distributor_id: order.distributor_id, product_id: item.product_id },
              lock: { mode: 'pessimistic_write' },
            });
            if (!distInv) {
               distInv = manager.getRepository(DistributorInventory).create({
                 distributor_id: order.distributor_id,
                 product_id: item.product_id,
                 available_quantity: qty,
                 reserved_quantity: 0,
                 backordered_quantity: 0,
                 low_stock_threshold: 0,
               });
               await manager.getRepository(DistributorInventory).save(distInv);
            } else {
               await manager.getRepository(DistributorInventory).increment(
                 { id: distInv.id },
                 'available_quantity',
                 qty
               );
            }
            await manager.getRepository(InventoryMovement).save({
              distributor_id: order.distributor_id,
              product_id: item.product_id,
              order_id: order.id,
              movement_type: 'PURCHASE_RECEIVED',
              quantity_change: qty,
              changed_by_user_id: userId,
              reason: `Purchase delivered: ${order.order_number}`,
            });

          } else {
            // Decrement DistributorInventory (Salesman Order)
            const distInv = await manager.getRepository(DistributorInventory).findOne({
              where: { distributor_id: order.distributor_id, product_id: item.product_id },
              lock: { mode: 'pessimistic_write' },
            });
            const distAvailableQty = distInv ? Number(distInv.available_quantity) : 0;
            if (distAvailableQty < qty) {
              throw new BadRequestException(
                `Insufficient inventory for product ${item.product_name_snapshot}. Required: ${qty}, Available: ${distAvailableQty}. Order remains in current status.`
              );
            }
            await manager.getRepository(DistributorInventory).decrement(
              { id: distInv!.id },
              'available_quantity',
              qty,
            );
            
            // Clean up legacy reservations if any safely
            if (item.reserved_quantity > 0) {
                await manager.getRepository(DistributorInventory).decrement({ id: distInv!.id }, 'reserved_quantity', item.reserved_quantity);
            }
            if (item.backordered_quantity > 0) {
                await manager.getRepository(DistributorInventory).decrement({ id: distInv!.id }, 'backordered_quantity', item.backordered_quantity);
                await manager.getRepository(Backorder).update({ order_id: order.id, product_id: item.product_id, status: 'OPEN' }, { status: 'CANCELLED' });
            }

            await manager.getRepository(InventoryMovement).save({
              distributor_id: order.distributor_id,
              product_id: item.product_id,
              order_id: order.id,
              movement_type: 'ORDER_DELIVERED',
              quantity_change: qty,
              changed_by_user_id: userId,
              reason: `Order delivered: ${order.order_number}`,
            });
          }
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
    queryDto: OrderListQueryDto = {} as any,
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
    } = queryDto || {};
    const skip = (page - 1) * limit;

    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.shop', 'shop')
      .leftJoinAndSelect('order.salesman', 'salesman')
      .leftJoinAndSelect('order.distributor', 'distributor')
      .leftJoinAndSelect('order.status', 'status');

    if (role === 'SUPER_ADMIN') {
      // No restriction — sees all orders globally
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.getDistributorOrFail(userId);
      qb.andWhere('order.distributor_id = :distId', { distId: dist.id });
    } else if (role === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (!mfr) throw new ForbiddenException('Manufacturer not found');
      qb.andWhere('order.manufacturer_id = :mfrId', { mfrId: mfr.id });
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
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.status', 'status')
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
    queryDto: ListQueryDto = {} as any,
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
    queryDto: ListQueryDto = {} as any,
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
    queryDto: ListQueryDto = {} as any,
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
