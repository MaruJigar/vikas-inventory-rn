import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPriceHistory } from './product-price-history.entity';
import { ProductPricingService } from './product-pricing.service';
import { ProductPricingController } from './product-pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPriceHistory])],
  providers: [ProductPricingService],
  controllers: [ProductPricingController],
  exports: [ProductPricingService],
})
export class ProductPricingModule {}
