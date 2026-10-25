import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { ManufacturerCatalogue } from './entities/manufacturer-catalogue.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ManufacturerCatalogue,
      Manufacturer,
      User,
    ]),
  ],
  controllers: [CatalogueController],
  providers: [CatalogueService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
