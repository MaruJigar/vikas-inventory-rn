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
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Salesman } from '../salesman/salesman.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { applyOwnership } from './shared/utils/report-builder.util';
import { resolvePeriodDateRange } from './shared/utils/period-helper.util';

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
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Manufacturer) private mfrRepo: Repository<Manufacturer>,
    @InjectRepository(Salesman) private salesmanRepo: Repository<Salesman>,
  ) {}

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

    applyOwnership(
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

    applyOwnership(
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
    const { startDate, endDate } = resolvePeriodDateRange(query.period, query.startDate, query.endDate);
    const limit = query.limit && query.limit > 0 ? query.limit : 50;

    const qb = this.orderRepo.createQueryBuilder('order');

    applyOwnership(
      qb,
      'order',
      userRole,
      userId,
      userRole === 'SALESMAN' ? 'salesman_id' : 'distributor_id',
    );

    if (startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('order.created_at <= :endDate', { endDate });
    }

    const totalsQb = qb.clone();
    totalsQb
      .select('COUNT(order.id)', 'total_orders')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'total_revenue')
      .addSelect("AVG(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'average_order_value')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NOT NULL THEN 1 ELSE 0 END)", 'cancelled_orders');
    const totalsResult = await totalsQb.getRawOne();

    // 2. Status Distribution
    const statusQb = qb.clone();
    statusQb
      .leftJoin('order.status', 'status')
      .select('status.name', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .groupBy('status.name');
    const statusDistribution = await statusQb.getRawMany();

    // 3. Revenue Trends (Grouped by Date)
    const trendsQb = qb.clone();
    trendsQb
      .select('DATE(order.created_at)', 'date')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'revenue')
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'ASC');
    const trends = await trendsQb.getRawMany();

    // 4. Salesman Performance (Configurable limit)
    const salesmanQb = qb.clone();
    salesmanQb
      .leftJoin('order.salesman', 'salesman')
      .select('salesman.id', 'salesman_id')
      .addSelect('salesman.full_name', 'salesman_name')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'revenue')
      .groupBy('salesman.id')
      .addGroupBy('salesman.full_name')
      .orderBy('revenue', 'DESC')
      .limit(limit);
    const topSalesmen = await salesmanQb.getRawMany();

    // 5. Distributor Performance (Configurable limit - Report 2.3)
    const distQb = qb.clone();
    distQb
      .leftJoin('order.distributor', 'distributor')
      .select('distributor.id', 'distributor_id')
      .addSelect('distributor.business_name', 'distributor_name')
      .addSelect('COUNT(order.id)', 'order_count')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'revenue')
      .addSelect("AVG(CASE WHEN order.cancelled_at IS NULL THEN order.final_order_amount ELSE 0 END)", 'average_order_value')
      .addSelect("SUM(CASE WHEN order.cancelled_at IS NOT NULL THEN 1 ELSE 0 END)", 'cancelled_orders')
      .groupBy('distributor.id')
      .addGroupBy('distributor.business_name')
      .orderBy('revenue', 'DESC')
      .limit(limit);
    const topDistributors = await distQb.getRawMany();

    return {
      period: query.period || 'custom',
      dateRange: { startDate, endDate },
      totals: {
        totalOrders: Number(totalsResult?.total_orders || 0),
        totalRevenue: Number(totalsResult?.total_revenue || 0),
        averageOrderValue: Number(totalsResult?.average_order_value || 0).toFixed(2),
        cancelledOrders: Number(totalsResult?.cancelled_orders || 0),
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
        id: s.salesman_id,
        name: s.salesman_name,
        orderCount: Number(s.order_count),
        revenue: Number(s.revenue),
      })),
      topDistributors: topDistributors.map((d) => ({
        id: d.distributor_id,
        name: d.distributor_name,
        orderCount: Number(d.order_count),
        revenue: Number(d.revenue),
        averageOrderValue: Number(d.average_order_value || 0).toFixed(2),
        cancelledOrders: Number(d.cancelled_orders || 0),
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

    applyOwnership(
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
    let threshold: number | null = null;
    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.distRepo.findOne({ where: { user_id: userId } });
      if (dist) threshold = dist.low_stock_threshold;
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
      if (mfr) threshold = mfr.low_stock_threshold;
    }

    const qb = this.invRepo
      .createQueryBuilder('inv')
      .select(
        threshold !== null && threshold !== undefined
          ? `SUM(CASE WHEN inv.available_quantity <= ${threshold} THEN 1 ELSE 0 END)`
          : '0',
        'low_stock',
      )
      .addSelect(
        'SUM(CASE WHEN inv.backordered_quantity > 0 THEN 1 ELSE 0 END)',
        'backordered_products',
      );

    applyOwnership(qb, 'inv', userRole, userId, 'distributor_id');

    const result = await qb.getRawOne();

    const mQb = this.movementRepo
      .createQueryBuilder('movement')
      .select('COUNT(movement.id)', 'adjustments');
    applyOwnership(mQb, 'movement', userRole, userId, 'distributor_id');
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

    applyOwnership(qb, 'b', userRole, userId, 'distributor_id');

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




  async getPlatformGrowth(query: AnalyticsQueryDto = {}) {
    const { startDate, endDate } = resolvePeriodDateRange(query.period, query.startDate, query.endDate);

    const mfrQb = this.mfrRepo.createQueryBuilder('m');
    const distQb = this.distRepo.createQueryBuilder('d');
    const salesQb = this.salesmanRepo.createQueryBuilder('s');
    const appQb = this.approvalRepo.createQueryBuilder('a');

    if (startDate) {
      mfrQb.andWhere('m.created_at >= :startDate', { startDate });
      distQb.andWhere('d.created_at >= :startDate', { startDate });
      salesQb.andWhere('s.created_at >= :startDate', { startDate });
      appQb.andWhere('a.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      mfrQb.andWhere('m.created_at <= :endDate', { endDate });
      distQb.andWhere('d.created_at <= :endDate', { endDate });
      salesQb.andWhere('s.created_at <= :endDate', { endDate });
      appQb.andWhere('a.created_at <= :endDate', { endDate });
    }

    const [
      totalManufacturers,
      activeManufacturers,
      totalDistributors,
      activeDistributors,
      internalDistributors,
      totalSalesmen,
      activeSalesmen,
    ] = await Promise.all([
      mfrQb.getCount(),
      mfrQb.clone().andWhere('m.is_active = true').getCount(),
      distQb.getCount(),
      distQb.clone().andWhere('d.is_active = true').getCount(),
      distQb.clone().andWhere('d.is_internal_distributor = true').getCount(),
      salesQb.getCount(),
      salesQb.clone().andWhere('s.is_active = true').getCount(),
    ]);

    // Approval turnaround and status counts
    const approvalSummaryRaw = await appQb
      .select('a.status', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .addSelect('AVG(EXTRACT(EPOCH FROM (a.updated_at - a.created_at)))', 'avg_turnaround_seconds')
      .groupBy('a.status')
      .getRawMany();

    const approvalBreakdown = {
      pending: 0,
      approved: 0,
      rejected: 0,
      avgTurnaroundHours: 0,
    };

    for (const r of approvalSummaryRaw) {
      const count = Number(r.count) || 0;
      if (r.status === 'PENDING_APPROVAL') approvalBreakdown.pending = count;
      if (r.status === 'APPROVED') {
        approvalBreakdown.approved = count;
        approvalBreakdown.avgTurnaroundHours = Number(((Number(r.avg_turnaround_seconds) || 0) / 3600).toFixed(1));
      }
      if (r.status === 'REJECTED') approvalBreakdown.rejected = count;
    }

    // Monthly registration trends
    const mfrTrends = await this.mfrRepo
      .createQueryBuilder('m')
      .select('DATE_TRUNC(\'month\', m.created_at)', 'month')
      .addSelect('COUNT(m.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const distTrends = await this.distRepo
      .createQueryBuilder('d')
      .select('DATE_TRUNC(\'month\', d.created_at)', 'month')
      .addSelect('COUNT(d.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    const salesTrends = await this.salesmanRepo
      .createQueryBuilder('s')
      .select('DATE_TRUNC(\'month\', s.created_at)', 'month')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      period: query.period || 'custom',
      dateRange: { startDate, endDate },
      summary: {
        manufacturers: {
          total: totalManufacturers,
          active: activeManufacturers,
          inactive: totalManufacturers - activeManufacturers,
        },
        distributors: {
          total: totalDistributors,
          active: activeDistributors,
          inactive: totalDistributors - activeDistributors,
          internal: internalDistributors,
          external: totalDistributors - internalDistributors,
        },
        salesmen: {
          total: totalSalesmen,
          active: activeSalesmen,
          inactive: totalSalesmen - activeSalesmen,
        },
        approvals: approvalBreakdown,
      },
      trends: {
        manufacturers: mfrTrends.map((t) => ({ month: t.month, count: Number(t.count) })),
        distributors: distTrends.map((t) => ({ month: t.month, count: Number(t.count) })),
        salesmen: salesTrends.map((t) => ({ month: t.month, count: Number(t.count) })),
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
