import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { Backorder } from '../order/backorder.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Notification } from '../notification/notification.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ShopVisit) private visitRepo: Repository<ShopVisit>,
    @InjectRepository(DistributorInventory)
    private invRepo: Repository<DistributorInventory>,
    @InjectRepository(Backorder) private backorderRepo: Repository<Backorder>,
    @InjectRepository(ApprovalRequest)
    private approvalRepo: Repository<ApprovalRequest>,
    @InjectRepository(WorkingDay) private wdRepo: Repository<WorkingDay>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(InventoryMovement)
    private movementRepo: Repository<InventoryMovement>,
  ) {}

  private applyOwnership(
    query: any,
    alias: string,
    userRole: string,
    userId: string,
    field: string,
  ) {
    if (userRole === 'DISTRIBUTOR_ADMIN') {
      if (field === 'requester_user_id') {
        query.andWhere(`${alias}.${field} = :userId`, { userId });
      } else {
        const distSubquery = `SELECT d.id FROM distributors d WHERE d.user_id = :userId`;
        query.andWhere(`${alias}.${field} IN (${distSubquery})`, { userId });
      }
    } else if (userRole === 'SALESMAN') {
      if (field === 'requester_user_id') {
        query.andWhere(`${alias}.${field} = :userId`, { userId });
      } else {
        const salesSubquery = `SELECT s.id FROM salesmen s WHERE s.user_id = :userId`;
        query.andWhere(`${alias}.${field} IN (${salesSubquery})`, { userId });
      }
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      if (field === 'distributor_id' || field === 'salesman_id') {
        // If it's salesman_id, we still map via distributor_id if it's there
        const qbSubquery = `
          SELECT md.distributor_id
          FROM manufacturer_distributors md
          INNER JOIN manufacturers m ON m.id = md.manufacturer_id
          WHERE m.user_id = :userId
        `;
        query.andWhere(`${alias}.distributor_id IN (${qbSubquery})`, {
          userId,
        });
      } else if (field === 'requester_user_id') {
        const userSubquery = `
          SELECT d.user_id
          FROM distributors d
          INNER JOIN manufacturer_distributors md ON md.distributor_id = d.id
          INNER JOIN manufacturers m ON m.id = md.manufacturer_id
          WHERE m.user_id = :userId
        `;
        query.andWhere(`${alias}.requester_user_id IN (${userSubquery})`, {
          userId,
        });
      }
    }
  }

  async getDashboard(userRole: string, userId: string) {
    const [
      workingDay,
      visits,
      orders,
      fulfillment,
      inventory,
      backorders,
      approvals,
      notifications,
    ] = await Promise.all([
      this.getWorkingDayAnalytics(userRole, userId),
      this.getVisitsAnalytics(userRole, userId),
      this.getOrdersAnalytics(userRole, userId),
      this.getFulfillmentAnalytics(userRole, userId),
      this.getInventoryAnalytics(userRole, userId),
      this.getBackordersAnalytics(userRole, userId),
      this.getApprovalsAnalytics(userRole, userId),
      this.getNotificationsAnalytics(userRole, userId),
    ]);

    return {
      workingDay,
      visits,
      orders,
      fulfillment,
      inventory,
      backorders,
      approvals,
      notifications,
    };
  }

  async getWorkingDayAnalytics(userRole: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const qb = this.wdRepo
      .createQueryBuilder('wd')
      .select('COUNT(wd.id)', 'total_active')
      .addSelect(
        'SUM(CASE WHEN wd.check_in_at >= :today THEN 1 ELSE 0 END)',
        'checked_in_today',
      )
      .addSelect(
        'SUM(CASE WHEN wd.check_out_at >= :today THEN 1 ELSE 0 END)',
        'checked_out_today',
      )
      .addSelect(
        'AVG(EXTRACT(EPOCH FROM (wd.check_out_at - wd.check_in_at))/3600)',
        'avg_hours',
      )
      .setParameter('today', today);

    this.applyOwnership(
      qb,
      'wd',
      userRole,
      userId,
      userRole === 'SALESMAN' ? 'salesman_id' : 'distributor_id',
    );

    const result = await qb.getRawOne();
    return {
      activeSalesmen: Number(result?.total_active || 0),
      checkedInToday: Number(result?.checked_in_today || 0),
      checkedOutToday: Number(result?.checked_out_today || 0),
      averageWorkingHours: Number(result?.avg_hours || 0).toFixed(2),
    };
  }

  async getVisitsAnalytics(userRole: string, userId: string) {
    const qb = this.visitRepo
      .createQueryBuilder('visit')
      .select('COUNT(visit.id)', 'total_visits')
      .addSelect(
        "SUM(CASE WHEN visit.status = 'IN_PROGRESS' THEN 1 ELSE 0 END)",
        'active_visits',
      )
      .addSelect(
        "SUM(CASE WHEN visit.status = 'COMPLETED' THEN 1 ELSE 0 END)",
        'completed_visits',
      )
      .addSelect(
        "SUM(CASE WHEN visit.status = 'COMPLETED' AND visit.no_order_reason IS NOT NULL THEN 1 ELSE 0 END)",
        'no_order_visits',
      );

    this.applyOwnership(
      qb,
      'visit',
      userRole,
      userId,
      userRole === 'SALESMAN' ? 'salesman_id' : 'distributor_id',
    );

    const result = await qb.getRawOne();
    const completed = Number(result?.completed_visits || 0);
    const withOrder = completed - Number(result?.no_order_visits || 0);
    const conversion =
      completed > 0 ? ((withOrder / completed) * 100).toFixed(2) : 0;

    return {
      totalVisits: Number(result?.total_visits || 0),
      activeVisits: Number(result?.active_visits || 0),
      completedVisits: completed,
      noOrderVisits: Number(result?.no_order_visits || 0),
      visitConversionRate: Number(conversion),
    };
  }

  async getOrdersAnalytics(
    userRole: string,
    userId: string,
    query: AnalyticsQueryDto = {},
  ) {
    const qb = this.orderRepo.createQueryBuilder('order');

    this.applyOwnership(
      qb,
      'order',
      userRole,
      userId,
      userRole === 'SALESMAN' ? 'salesman_id' : 'distributor_id',
    );

    if (query.startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('order.created_at <= :endDate', { endDate: query.endDate });
    }

    const totalsQb = qb.clone();
    totalsQb
      .select('COUNT(order.id)', 'total_orders')
      .addSelect('SUM(order.final_order_amount)', 'total_revenue')
      .addSelect('AVG(order.final_order_amount)', 'average_order_value');
    const totalsResult = await totalsQb.getRawOne();

    // 2. Status Distribution
    const statusQb = qb.clone();
    statusQb
      .leftJoin('order.status', 'status')
      .select('status.name', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('status.name');
    const statusDistribution = await statusQb.getRawMany();

    // 3. Revenue Trends (Daily)
    const trendsQb = qb.clone();
    trendsQb
      .select('DATE(order.created_at)', 'date')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect('SUM(order.final_order_amount)', 'revenue')
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'ASC');
    const trends = await trendsQb.getRawMany();

    // 4. Salesman Performance (Top 5)
    const salesmanQb = qb.clone();
    salesmanQb
      .leftJoin('order.salesman', 'salesman')
      .select('salesman.full_name', 'salesman_name')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect('SUM(order.final_order_amount)', 'revenue')
      .groupBy('salesman.id')
      .addGroupBy('salesman.full_name')
      .orderBy('revenue', 'DESC')
      .limit(5);
    const topSalesmen = await salesmanQb.getRawMany();

    // 5. Distributor Performance (Top 5)
    const distQb = qb.clone();
    distQb
      .leftJoin('order.distributor', 'distributor')
      .select('distributor.business_name', 'distributor_name')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect('SUM(order.final_order_amount)', 'revenue')
      .groupBy('distributor.id')
      .addGroupBy('distributor.business_name')
      .orderBy('revenue', 'DESC')
      .limit(5);
    const topDistributors = await distQb.getRawMany();

    return {
      totals: {
        totalOrders: Number(totalsResult?.total_orders || 0),
        totalRevenue: Number(totalsResult?.total_revenue || 0),
        averageOrderValue: Number(totalsResult?.average_order_value || 0).toFixed(2),
      },
      statusDistribution: statusDistribution.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
      trends: trends.map((t) => ({
        date: t.date,
        orderCount: Number(t.order_count),
        revenue: Number(t.revenue),
      })),
      topSalesmen: topSalesmen.map((s) => ({
        name: s.salesman_name,
        orderCount: Number(s.order_count),
        revenue: Number(s.revenue),
      })),
      topDistributors: topDistributors.map((d) => ({
        name: d.distributor_name,
        orderCount: Number(d.order_count),
        revenue: Number(d.revenue),
      })),
    };
  }

  async getFulfillmentAnalytics(userRole: string, userId: string) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.status', 'status')
      .select(
        "SUM(CASE WHEN status.name IN ('CONFIRMED', 'PARTIALLY_DISPATCHED') THEN 1 ELSE 0 END)",
        'pending_dispatch',
      )
      .addSelect(
        "SUM(CASE WHEN status.name = 'DISPATCHED' THEN 1 ELSE 0 END)",
        'dispatched',
      )
      .addSelect(
        "SUM(CASE WHEN status.name = 'DELIVERED' THEN 1 ELSE 0 END)",
        'delivered',
      )
      .addSelect(
        "SUM(CASE WHEN status.name = 'PARTIALLY_DELIVERED' THEN 1 ELSE 0 END)",
        'partial',
      );

    this.applyOwnership(
      qb,
      'order',
      userRole,
      userId,
      userRole === 'SALESMAN' ? 'salesman_id' : 'distributor_id',
    );

    const result = await qb.getRawOne();
    return {
      ordersPendingDispatch: Number(result?.pending_dispatch || 0),
      ordersDispatched: Number(result?.dispatched || 0),
      ordersDelivered: Number(result?.delivered || 0),
      partialDeliveries: Number(result?.partial || 0),
    };
  }

  async getInventoryAnalytics(userRole: string, userId: string) {
    const qb = this.invRepo
      .createQueryBuilder('inv')
      .select(
        'SUM(CASE WHEN inv.available_quantity <= 10 THEN 1 ELSE 0 END)',
        'low_stock',
      )
      .addSelect(
        'SUM(CASE WHEN inv.backordered_quantity > 0 THEN 1 ELSE 0 END)',
        'backordered_products',
      );

    this.applyOwnership(qb, 'inv', userRole, userId, 'distributor_id');

    const result = await qb.getRawOne();

    const mQb = this.movementRepo
      .createQueryBuilder('movement')
      .select('COUNT(movement.id)', 'adjustments');
    this.applyOwnership(mQb, 'movement', userRole, userId, 'distributor_id');
    const mResult = await mQb.getRawOne();

    return {
      lowStockProducts: Number(result?.low_stock || 0),
      backorderedProducts: Number(result?.backordered_products || 0),
      inventoryAdjustments: Number(mResult?.adjustments || 0),
    };
  }

  async getBackordersAnalytics(userRole: string, userId: string) {
    const qb = this.backorderRepo
      .createQueryBuilder('b')
      .select(
        "SUM(CASE WHEN b.status IN ('OPEN', 'PARTIALLY_ALLOCATED') THEN 1 ELSE 0 END)",
        'open_backorders',
      )
      .addSelect(
        "SUM(CASE WHEN b.status = 'RESOLVED' THEN 1 ELSE 0 END)",
        'resolved_backorders',
      )
      .addSelect(
        'SUM((b.quantity - b.resolved_quantity) * 100)',
        'backorder_value',
      ); // dummy value metric if price not joined

    this.applyOwnership(qb, 'b', userRole, userId, 'distributor_id');

    const result = await qb.getRawOne();
    return {
      openBackorders: Number(result?.open_backorders || 0),
      resolvedBackorders: Number(result?.resolved_backorders || 0),
      backorderValue: Number(result?.backorder_value || 0),
    };
  }

  async getApprovalsAnalytics(userRole: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const qb = this.approvalRepo
      .createQueryBuilder('app')
      .select(
        "SUM(CASE WHEN app.status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END)",
        'pending',
      )
      .addSelect(
        "SUM(CASE WHEN app.status = 'APPROVED' AND app.updated_at >= :today THEN 1 ELSE 0 END)",
        'approved_today',
      )
      .addSelect(
        "SUM(CASE WHEN app.status = 'REJECTED' AND app.updated_at >= :today THEN 1 ELSE 0 END)",
        'rejected_today',
      )
      .setParameter('today', today);

    if (userRole === 'MANUFACTURER_ADMIN') {
      const mfgSubquery = `SELECT m.id FROM manufacturers m WHERE m.user_id = :userId`;
      qb.andWhere(`app.manufacturer_id IN (${mfgSubquery})`, { userId });
      qb.andWhere('app.request_type = :type', { type: 'DISTRIBUTOR_APPROVAL' });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      const distSubquery = `SELECT d.id FROM distributors d WHERE d.user_id = :userId`;
      qb.andWhere(`app.distributor_id IN (${distSubquery})`, { userId });
      qb.andWhere('app.request_type IN (:...types)', { types: ['SALESMAN_APPROVAL', 'SHOP_APPROVAL'] });
    } else if (userRole !== 'SUPER_ADMIN') {
      qb.andWhere('1=0');
    }

    const result = await qb.getRawOne();
    return {
      pendingRequestsCount: Number(result?.pending || 0),
      approvedRequestsCount: Number(result?.approved_today || 0),
      rejectedRequestsCount: Number(result?.rejected_today || 0),
    };
  }

  async getNotificationsAnalytics(userRole: string, userId: string) {
    const count = await this.notifRepo.count({
      where: { recipient_user_id: userId, is_read: false },
    });
    return {
      unreadNotifications: count,
    };
  }
}
