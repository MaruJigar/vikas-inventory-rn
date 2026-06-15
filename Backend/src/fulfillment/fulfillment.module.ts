import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FulfillmentController } from './fulfillment.controller';
import { FulfillmentService } from './fulfillment.service';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderStatusHistory } from '../order/order-status-history.entity';
import { FulfillmentLog } from '../order/fulfillment-log.entity';
import { Backorder } from '../order/backorder.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { Distributor } from '../distributor/distributor.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderStatusHistory,
      FulfillmentLog,
      Backorder,
      DistributorInventory,
      InventoryMovement,
      Distributor,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [FulfillmentController],
  providers: [FulfillmentService],
  exports: [FulfillmentService],
})
export class FulfillmentModule {}
