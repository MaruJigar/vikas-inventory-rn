import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributorInventory } from '../../inventory/distributor-inventory.entity';
import { ManufacturerInventory } from '../../inventory/manufacturer-inventory.entity';
import { applyOwnership } from '../shared/utils/report-builder.util';

@Injectable()
export class InventoryReportsService {
  constructor(
    @InjectRepository(DistributorInventory)
    private distInvRepo: Repository<DistributorInventory>,
    @InjectRepository(ManufacturerInventory)
    private mfrInvRepo: Repository<ManufacturerInventory>,
  ) {}

  async getInventoryValuation(userRole: string, userId: string) {
    let qb;

    if (userRole === 'MANUFACTURER_ADMIN') {
      qb = this.mfrInvRepo.createQueryBuilder('inv');
      qb.innerJoin('inv.product', 'product')
        .leftJoin('product.category', 'category');

      const mSubquery = `SELECT m.id FROM manufacturers m WHERE m.user_id = :userId`;
      qb.andWhere(`inv.manufacturer_id IN (${mSubquery})`, { userId });
      qb.andWhere(`product.manufacturer_id IN (${mSubquery})`, { userId });
    } else if (userRole === 'DISTRIBUTOR_ADMIN') {
      qb = this.distInvRepo.createQueryBuilder('inv');
      qb.innerJoin('inv.product', 'product')
        .leftJoin('product.category', 'category');

      applyOwnership(qb, 'inv', userRole, userId, 'distributor_id');
    } else {
      return [];
    }

    qb.select('product.name', 'product_name')
      .addSelect('product.sku', 'sku')
      .addSelect('category.name', 'category_name')
      .addSelect('SUM(inv.available_quantity)', 'available_quantity')
      .addSelect('SUM(inv.reserved_quantity)', 'reserved_quantity')
      .addSelect('MAX(product.mrp)', 'mrp')
      .addSelect('SUM(inv.available_quantity * product.mrp)', 'stock_value')
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.sku')
      .addGroupBy('category.name');

    const rawData = await qb.getRawMany();
    return rawData.map(row => ({
      productName: row.product_name,
      sku: row.sku,
      categoryName: row.category_name,
      availableQuantity: Number(row.available_quantity),
      reservedQuantity: Number(row.reserved_quantity),
      mrp: Number(row.mrp),
      stockValue: Number(row.stock_value),
    }));
  }
}
