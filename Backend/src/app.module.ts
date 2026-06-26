import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { McpModule } from '@nestjs-mcp/server';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
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
import { OrderModule } from './order/order.module';
import { BillingModule } from './billing/billing.module';
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
import { MetricsModule } from './metrics/metrics.module';
import { McpToolsModule } from './mcp-tools/mcp-tools.module';
import { VisitModule } from './visit/visit.module';
import { QueueModule } from './queue/queue.module';
import { EmailModule } from './email/email.module';

import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { metricsConfig } from './config/metrics.config';
import { queueConfig } from './config/queue.config';
import { validateEnv } from './config/env.validation';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';

import { getUploadRoot } from './common/utils/upload-path.util';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { MetricsMiddleware } from './common/middleware/metrics.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: getUploadRoot(),
      serveRoot: '/uploads',
    }),
    McpModule.forRoot({
      name: 'Vikas Inventory MCP Server',
      version: '1.0.0',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        rateLimitConfig,
        metricsConfig,
        queueConfig,
      ],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'default',
          ttl: config.get<number>('rateLimit.global.ttl', 60000),
          limit: config.get<number>('rateLimit.global.max', 100),
        },
        {
          name: 'auth',
          ttl: config.get<number>('rateLimit.auth.ttl', 60000),
          limit: config.get<number>('rateLimit.auth.max', 5),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [databaseConfig.KEY, ConfigService],
      useFactory: (dbConfigService: any, configService: ConfigService) => ({
        type: 'postgres',
        host: dbConfigService.host,
        port: dbConfigService.port,
        username: dbConfigService.user,
        password: dbConfigService.password,
        database: dbConfigService.name,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    RolePermissionModule,
    ApprovalModule,
    ManufacturerModule,
    DistributorModule,
    SalesmanModule,
    ProductModule,
    ProductPricingModule,
    InventoryModule,
    ShopModule,
    ShopImageModule,
    ShopDuplicateDetectionModule,
    OrderModule,
    BillingModule,
    LocationModule,
    WorkingDayModule,
    OfflineSyncModule,
    NotificationModule,
    SocketGatewayModule,
    FirebaseNotificationModule,
    AnalyticsModule,
    BackgroundJobModule,
    AuditLogModule,
    AdminPanelApiModule,
    HealthModule,
    MetricsModule,
    McpToolsModule,
    VisitModule,
    QueueModule.forRoot(),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requestIdMiddleware).forRoutes('*');
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
