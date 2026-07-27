import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../order/order.entity';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { applyOwnership } from '../shared/utils/report-builder.util';

@Injectable()
export class SalesReportsService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  async getSalesSummary(userRole: string, userId: string, query: AnalyticsQueryDto = {}) {
    const qb = this.orderRepo.createQueryBuilder('order');
    qb.innerJoin('order.items', 'items')
      .innerJoin('items.product', 'product')
      .leftJoin('product.category', 'category');

    if (userRole === 'MANUFACTURER_ADMIN') {
      const mSubquery = `SELECT m.id FROM manufacturers m WHERE m.user_id = :userId`;
      qb.andWhere(`order.manufacturer_id IN (${mSubquery})`, { userId });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      applyOwnership(qb, 'order', userRole, userId, 'distributor_id');
      qb.andWhere(`order.shop_id IS NOT NULL`);
    } else {
      return [];
    }

    if (query.startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('order.created_at <= :endDate', { endDate: query.endDate });
    }

    qb.select('product.name', 'product_name')
      .addSelect('product.sku', 'sku')
      .addSelect('category.name', 'category_name')
      .addSelect('SUM(items.quantity)', 'quantity_sold')
      .addSelect('SUM(items.net_line_amount)', 'total_revenue')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.sku')
      .addGroupBy('category.name')
      .orderBy('total_revenue', 'DESC');

    const rawData = await qb.getRawMany();
    return rawData.map(row => ({
      productName: row.product_name,
      sku: row.sku,
      categoryName: row.category_name,
      quantitySold: Number(row.quantity_sold),
      totalRevenue: Number(row.total_revenue),
    }));
  }
}
