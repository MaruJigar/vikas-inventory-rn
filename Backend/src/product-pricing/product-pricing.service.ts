import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductPriceHistory } from './product-price-history.entity';

@Injectable()
export class ProductPricingService {
  constructor(
    @InjectRepository(ProductPriceHistory) private historyRepo: Repository<ProductPriceHistory>,
  ) {}

  async logPriceChange(productId: string, oldData: any, newData: any, userId: string, reason: string) {
    const log = this.historyRepo.create({
      product_id: productId,
      old_mrp: oldData.mrp,
      new_mrp: newData.mrp,
      old_gst_percent: oldData.gst_percent,
      new_gst_percent: newData.gst_percent,
      old_distributor_discount_percent: oldData.distributor_discount_percent,
      new_distributor_discount_percent: newData.distributor_discount_percent,
      old_special_discount_percent: oldData.special_discount_percent,
      new_special_discount_percent: newData.special_discount_percent,
      changed_by_user_id: userId,
      reason: reason,
    });
    return this.historyRepo.save(log);
  }

  async getHistory(productId: string) {
    return this.historyRepo.find({ where: { product_id: productId }, order: { created_at: 'DESC' } });
  }
}
