import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
