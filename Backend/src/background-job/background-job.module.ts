import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundJob } from './background-job.entity';
import { BackgroundJobService } from './background-job.service';
import { BackgroundJobController } from './background-job.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BackgroundJob])],
  controllers: [BackgroundJobController],
  providers: [BackgroundJobService],
  exports: [BackgroundJobService],
})
export class BackgroundJobModule {}
