import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SalesReportsController } from './sales/sales-reports.controller';
import { SalesReportsService } from './sales/sales-reports.service';
import { InventoryReportsController } from './inventory/inventory-reports.controller';
import { InventoryReportsService } from './inventory/inventory-reports.service';
import { Order } from '../order/order.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { ManufacturerInventory } from '../inventory/manufacturer-inventory.entity';
import { Backorder } from '../order/backorder.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Notification } from '../notification/notification.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      ShopVisit,
      DistributorInventory,
      ManufacturerInventory,
      Backorder,
      ApprovalRequest,
      WorkingDay,
      Salesman,
      Notification,
      InventoryMovement,
    ]),
    SocketGatewayModule,
  ],
  controllers: [
    AnalyticsController,
    SalesReportsController,
    InventoryReportsController,
  ],
  providers: [
    AnalyticsService,
    SalesReportsService,
    InventoryReportsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
