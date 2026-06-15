import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductCategory } from './product-category.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductImageController } from './product-image.controller';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductPricingModule } from '../product-pricing/product-pricing.module';
import { ShopImageModule } from '../shop-image/shop-image.module';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
      Distributor,
      Manufacturer,
    ]),
    ProductPricingModule,
    ShopImageModule,
  ],
  providers: [ProductService, CategoryService],
  controllers: [ProductController, CategoryController, ProductImageController],
  exports: [ProductService, CategoryService],
})
export class ProductModule {}
