import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundJobService } from './background-job.service';
import { BackgroundJob } from './background-job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BackgroundJob])],
  providers: [BackgroundJobService],
  exports: [BackgroundJobService],
})
export class BackgroundJobModule {}
