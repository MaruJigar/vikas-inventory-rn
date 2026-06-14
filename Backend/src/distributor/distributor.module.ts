import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DistributorService } from './distributor.service';
import { DistributorController } from './distributor.controller';
import { Distributor } from './distributor.entity';
import { ManufacturerDistributor } from './manufacturer-distributor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distributor, ManufacturerDistributor]), AuditLogModule],
  providers: [DistributorService],
  controllers: [DistributorController],
  exports: [DistributorService],
})
export class DistributorModule {}
