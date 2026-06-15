import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingDay } from './working-day.entity';
import { LocationLog } from '../location/location-log.entity';
import { LatestLocation } from '../location/latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { WorkingDayService } from './working-day.service';
import { WorkingDayController } from './working-day.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkingDay,
      LocationLog,
      LatestLocation,
      Salesman,
      Distributor,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [WorkingDayController],
  providers: [WorkingDayService],
  exports: [WorkingDayService],
})
export class WorkingDayModule {}
