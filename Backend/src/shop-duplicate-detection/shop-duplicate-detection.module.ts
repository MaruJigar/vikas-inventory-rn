import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopDuplicateLog } from './shop-duplicate-log.entity';
import { ShopDuplicateDetectionService } from './shop-duplicate-detection.service';
import { Shop } from '../shop/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopDuplicateLog, Shop])],
  providers: [ShopDuplicateDetectionService],
  exports: [ShopDuplicateDetectionService],
})
export class ShopDuplicateDetectionModule {}
