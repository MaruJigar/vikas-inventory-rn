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
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';
import { AttendanceAnalyticsController } from './attendance-analytics.controller';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { WorkingDayModule } from '../working-day/working-day.module';

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
      Manufacturer,
      Distributor,
    ]),
    SocketGatewayModule,
    WorkingDayModule,
  ],
  controllers: [
    AnalyticsController,
    SalesReportsController,
    InventoryReportsController,
    AttendanceAnalyticsController,
  ],
  providers: [
    AnalyticsService,
    SalesReportsService,
    InventoryReportsService,
    AttendanceAnalyticsService,
  ],
  exports: [AnalyticsService, AttendanceAnalyticsService],
})
export class AnalyticsModule {}
