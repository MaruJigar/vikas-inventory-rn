import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributorInventory } from './distributor-inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { BackordersController } from './backorders.controller';
import { BackordersService } from './backorders.service';
import { Distributor } from '../distributor/distributor.entity';
import { Product } from '../product/product.entity';
import { Backorder } from '../order/backorder.entity';
import { OrderItem } from '../order/order-item.entity';
import { Order } from '../order/order.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DistributorInventory, InventoryMovement, Distributor, Product,
      Backorder, OrderItem, Order
    ]),
    AuditLogModule,
    SocketGatewayModule,
    NotificationModule,
  ],
  controllers: [InventoryController, BackordersController],
  providers: [InventoryService, BackordersService],
  exports: [InventoryService, BackordersService],
})
export class InventoryModule {}
