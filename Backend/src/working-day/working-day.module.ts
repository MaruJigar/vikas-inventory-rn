import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingDay } from './working-day.entity';
import { LocationLog } from '../location/location-log.entity';
import { LatestLocation } from '../location/latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { WorkingDayService } from './working-day.service';
import { WorkingDayController } from './working-day.controller';
import { Holiday } from './holiday.entity';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { WorkingDayCalculatorService } from './working-day-calculator.service';
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
      Holiday,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [WorkingDayController, HolidayController],
  providers: [WorkingDayService, HolidayService, WorkingDayCalculatorService],
  exports: [WorkingDayService, WorkingDayCalculatorService],
})
export class WorkingDayModule {}
