import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { OrderModule } from '../order/order.module';
import { InvoiceService } from './invoice.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { InvoiceTokenStore } from './invoice-token.store';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Manufacturer, Distributor]),
    // Import OrderModule to access OrderService (which owns getOrderById + auth checks)
    OrderModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, InvoicePdfService, InvoiceTokenStore],
  exports: [InvoiceService],
})
export class InvoiceModule {}
