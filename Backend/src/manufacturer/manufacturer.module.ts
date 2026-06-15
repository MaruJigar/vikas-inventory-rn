import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerController } from './manufacturer.controller';
import { Manufacturer } from './manufacturer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Manufacturer]), AuditLogModule],
  providers: [ManufacturerService],
  controllers: [ManufacturerController],
  exports: [ManufacturerService],
})
export class ManufacturerModule {}
