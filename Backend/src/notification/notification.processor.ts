import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationService } from './notification.service';
import { MetricsService } from '../metrics/metrics.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly metricsService: MetricsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing notification job ${job.id}`);

    if (job.name === 'create-notification') {
      const { userId, role, title, message, type, entityType, entityId } = job.data;
      
      // Execute the original synchronous logic safely in the background
      await this.notificationService.createNotification(
        userId,
        role,
        title,
        message,
        type,
        entityType,
        entityId,
      );

      return { success: true };
    }

    this.logger.warn(`Unknown notification job name: ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    const type = job.data?.type || 'unknown';
    this.metricsService.notificationJobsTotal.labels(type, 'completed').inc();
    this.logger.log(`Notification job ${job.id} completed successfully!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    const type = job.data?.type || 'unknown';
    this.metricsService.notificationJobsTotal.labels(type, 'failed').inc();
    
    const maxAttempts = job.opts.attempts || 1;
    
    // Check if this is the final attempt
    if (job.attemptsMade >= maxAttempts) {
      this.metricsService.notificationFailuresTotal.labels(type).inc();
      this.logger.error(
        `Notification job ${job.id} (type: ${type}) permanently failed after ${job.attemptsMade} attempts: ${error.message}`,
        { targetUserId: job.data?.userId, payload: job.data },
      );
    } else {
      this.logger.warn(`Notification job ${job.id} failed, will retry. Attempt ${job.attemptsMade}/${maxAttempts}. Error: ${error.message}`);
    }
  }
}
