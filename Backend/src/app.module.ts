import { Module } from '@nestjs/common';
import { McpModule } from '@nestjs-mcp/server';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { ApprovalModule } from './approval/approval.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { DistributorModule } from './distributor/distributor.module';
import { SalesmanModule } from './salesman/salesman.module';
import { ProductModule } from './product/product.module';
import { ProductPricingModule } from './product-pricing/product-pricing.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShopModule } from './shop/shop.module';
import { ShopImageModule } from './shop-image/shop-image.module';
import { ShopDuplicateDetectionModule } from './shop-duplicate-detection/shop-duplicate-detection.module';
import { ShopVisitModule } from './shop-visit/shop-visit.module';
import { OrderModule } from './order/order.module';
import { OrderRevisionModule } from './order-revision/order-revision.module';
import { BillingModule } from './billing/billing.module';
import { BackorderModule } from './backorder/backorder.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { LocationModule } from './location/location.module';
import { WorkingDayModule } from './working-day/working-day.module';
import { OfflineSyncModule } from './offline-sync/offline-sync.module';
import { NotificationModule } from './notification/notification.module';
import { SocketGatewayModule } from './socket-gateway/socket-gateway.module';
import { FirebaseNotificationModule } from './firebase-notification/firebase-notification.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BackgroundJobModule } from './background-job/background-job.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AdminPanelApiModule } from './admin-panel-api/admin-panel-api.module';
import { HealthModule } from './health/health.module';
import { McpToolsModule } from './mcp-tools/mcp-tools.module';
import { VisitModule } from './visit/visit.module';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'Vikas Inventory MCP Server',
      version: '1.0.0',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASS', 'postgres'),
        database: configService.get<string>('DB_NAME', 'vikas_inventory'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Should be false in production
        logging: true,
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule, UserModule, RolePermissionModule, ApprovalModule, ManufacturerModule, DistributorModule, SalesmanModule, ProductModule, ProductPricingModule, InventoryModule, ShopModule, ShopImageModule, ShopDuplicateDetectionModule, ShopVisitModule, OrderModule, OrderRevisionModule, BillingModule, BackorderModule, FulfillmentModule, LocationModule, WorkingDayModule, OfflineSyncModule, NotificationModule, SocketGatewayModule, FirebaseNotificationModule, AnalyticsModule, BackgroundJobModule, AuditLogModule, AdminPanelApiModule, HealthModule, McpToolsModule, VisitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
