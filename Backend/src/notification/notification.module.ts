import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationProcessor } from './notification.processor';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';
import { BullModule } from '@nestjs/bullmq';
import { MetricsModule } from '../metrics/metrics.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    AuditLogModule,
    SocketGatewayModule,
    MetricsModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationQueueService, NotificationProcessor],
  exports: [NotificationService, NotificationQueueService],
})
export class NotificationModule {}
