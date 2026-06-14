import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitController } from './visit.controller';
import { VisitService } from './visit.service';
import { ShopVisit } from './shop-visit.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Shop } from '../shop/shop.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Order } from '../order/order.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShopVisit,
      Salesman,
      Distributor,
      Shop,
      WorkingDay,
      Order,
      Manufacturer,
      ManufacturerDistributor,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [VisitController],
  providers: [VisitService],
})
export class VisitModule {}
