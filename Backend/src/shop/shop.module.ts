import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ShopDuplicateDetectionModule } from '../shop-duplicate-detection/shop-duplicate-detection.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Distributor, Salesman]),
    ShopDuplicateDetectionModule
  ],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
