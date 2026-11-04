import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../order/order.entity';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { applyOwnership } from '../shared/utils/report-builder.util';
import { resolvePeriodDateRange } from '../shared/utils/period-helper.util';

@Injectable()
export class SalesReportsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async getSalesSummary(userRole: string, userId: string, query: AnalyticsQueryDto = {}) {
    const { startDate, endDate } = resolvePeriodDateRange(query.period, query.startDate, query.endDate);

    const qb = this.orderRepo.createQueryBuilder('order');
    qb.innerJoin('order.items', 'items')
      .innerJoin('items.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('order.distributor', 'distributor');

    if (userRole === 'MANUFACTURER_ADMIN') {
      const mSubquery = `SELECT m.id FROM manufacturers m WHERE m.user_id = :userId`;
      qb.andWhere(`order.manufacturer_id IN (${mSubquery})`, { userId });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      applyOwnership(qb, 'order', userRole, userId, 'distributor_id');
      qb.andWhere(`order.shop_id IS NOT NULL`);
    } else if (userRole === 'SUPER_ADMIN') {
      // Super admin sees all platform sales
    } else {
      return { summary: {}, items: [], distributorBreakdown: [] };
    }

    if (startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('order.created_at <= :endDate', { endDate });
    }

    // Overall summary metrics
    const summaryQb = this.orderRepo.createQueryBuilder('order');
    if (userRole === 'MANUFACTURER_ADMIN') {
      const mSubquery = `SELECT m.id FROM manufacturers m WHERE m.user_id = :userId`;
      summaryQb.andWhere(`order.manufacturer_id IN (${mSubquery})`, { userId });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      applyOwnership(summaryQb, 'order', userRole, userId, 'distributor_id');
      summaryQb.andWhere(`order.shop_id IS NOT NULL`);
    }

    if (startDate) summaryQb.andWhere('order.created_at >= :startDate', { startDate });
    if (endDate) summaryQb.andWhere('order.created_at <= :endDate', { endDate });

    summaryQb
      .select('COUNT(order.id)', 'total_orders')
      .addSelect('SUM(order.total_quantity)', 'total_quantity')
      .addSelect('SUM(order.gross_order_amount)', 'gross_sales')
      .addSelect('SUM(order.total_gst_amount)', 'total_gst')
      .addSelect(
        'SUM(order.standard_discount_amount + order.distributor_discount_amount + order.special_discount_amount + order.cash_discount_amount)',
        'total_discounts',
      )
      .addSelect('SUM(order.final_order_amount)', 'net_sales');

    const summaryResult = await summaryQb.getRawOne();

    // SKU-wise sales
    const itemsQb = qb.clone();
    itemsQb
      .select('product.name', 'product_name')
      .addSelect('product.sku', 'sku')
      .addSelect('category.name', 'category_name')
      .addSelect('SUM(items.quantity)', 'quantity_sold')
      .addSelect('SUM(items.gross_line_amount)', 'gross_line_amount')
      .addSelect('SUM(items.net_line_amount)', 'total_revenue')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.sku')
      .addGroupBy('category.name')
      .orderBy('total_revenue', 'DESC');

    const rawItems = await itemsQb.getRawMany();

    // Distributor-wise sales breakdown (for Manufacturer & Super Admin)
    let distributorBreakdown: any[] = [];
    if (userRole === 'MANUFACTURER_ADMIN' || userRole === 'SUPER_ADMIN') {
      const distQb = qb.clone();
      distQb
        .select('distributor.id', 'distributor_id')
        .addSelect('distributor.business_name', 'distributor_name')
        .addSelect('COUNT(DISTINCT order.id)', 'order_count')
        .addSelect('SUM(order.final_order_amount)', 'total_revenue')
        .groupBy('distributor.id')
        .addGroupBy('distributor.business_name')
        .orderBy('total_revenue', 'DESC');

      const rawDist = await distQb.getRawMany();
      distributorBreakdown = rawDist.map((d) => ({
        distributorId: d.distributor_id,
        distributorName: d.distributor_name,
        orderCount: Number(d.order_count || 0),
        totalRevenue: Number(d.total_revenue || 0),
      }));
    }

    return {
      period: query.period || 'custom',
      dateRange: { startDate, endDate },
      summary: {
        totalOrders: Number(summaryResult?.total_orders || 0),
        totalQuantity: Number(summaryResult?.total_quantity || 0),
        grossSales: Number(summaryResult?.gross_sales || 0),
        totalDiscounts: Number(summaryResult?.total_discounts || 0),
        totalGst: Number(summaryResult?.total_gst || 0),
        netSales: Number(summaryResult?.net_sales || 0),
      },
      items: rawItems.map((row) => ({
        productName: row.product_name,
        sku: row.sku,
        categoryName: row.category_name,
        quantitySold: Number(row.quantity_sold),
        grossAmount: Number(row.gross_line_amount || row.total_revenue),
        totalRevenue: Number(row.total_revenue),
      })),
      distributorBreakdown,
      generatedAt: new Date().toISOString(),
    };
  }
}
