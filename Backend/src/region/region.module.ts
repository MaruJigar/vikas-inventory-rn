import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { State } from './entities/state.entity';
import { City } from './entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([State, City])],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService],
})
export class RegionModule {}
