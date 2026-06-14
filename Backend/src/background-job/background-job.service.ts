import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackgroundJob } from './background-job.entity';

@Injectable()
export class BackgroundJobService {
  private readonly logger = new Logger(BackgroundJobService.name);

  constructor(
    @InjectRepository(BackgroundJob) private jobRepo: Repository<BackgroundJob>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingJobs() {
    this.logger.debug('Polling background_jobs table for PENDING jobs...');
    
    const pendingJobs = await this.jobRepo.find({
      where: { status: 'PENDING' },
      take: 10,
    });

    for (const job of pendingJobs) {
      try {
        job.status = 'PROCESSING';
        job.started_at = new Date();
        job.attempts += 1;
        await this.jobRepo.save(job);

        // MOCK EXECUTION LOGIC
        this.logger.debug(`Executing job ${job.id} (${job.job_type})`);
        
        job.status = 'COMPLETED';
        job.completed_at = new Date();
        await this.jobRepo.save(job);
      } catch (err) {
        job.status = job.attempts >= job.max_attempts ? 'FAILED' : 'PENDING';
        job.error_message = err.message;
        if (job.status === 'FAILED') job.failed_at = new Date();
        await this.jobRepo.save(job);
      }
    }
  }

  async enqueueJob(jobType: string, payload: any) {
    const job = this.jobRepo.create({
      job_type: jobType,
      payload,
      status: 'PENDING',
    });
    return this.jobRepo.save(job);
  }
}
