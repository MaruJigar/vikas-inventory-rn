import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { ManufacturerCatalogue } from './entities/manufacturer-catalogue.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { User } from '../user/user.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ManufacturerCatalogue,
      Manufacturer,
      User,
      Distributor,
      Salesman,
      ManufacturerDistributor,
    ]),
  ],
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
