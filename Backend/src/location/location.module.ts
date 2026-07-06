import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationLog } from './location-log.entity';
import { LatestLocation } from './latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SocketGatewayModule } from '../socket-gateway/socket-gateway.module';

import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationLog,
      LatestLocation,
      Salesman,
      Distributor,
      WorkingDay,
      Manufacturer,
      ManufacturerDistributor,
    ]),
    AuditLogModule,
    SocketGatewayModule,
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
