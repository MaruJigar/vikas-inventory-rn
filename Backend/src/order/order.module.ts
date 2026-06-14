import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderRevision } from './order-revision.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Backorder } from './backorder.entity';
import { FulfillmentLog } from './fulfillment-log.entity';
import { OrderService } from './order.service';
import { OrdersController } from './order.controller';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { Shop } from '../shop/shop.entity';
import { Product } from '../product/product.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderRevision,
      OrderStatusHistory,
      Backorder,
      FulfillmentLog,
      Salesman,
      Distributor,
      Manufacturer,
      ManufacturerDistributor,
      ShopVisit,
      Shop,
      Product,
      DistributorInventory,
      InventoryMovement,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [OrdersController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
