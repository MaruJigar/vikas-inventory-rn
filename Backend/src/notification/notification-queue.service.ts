import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  /**
   * Enqueues a notification to be processed asynchronously.
   * Signature intentionally mirrors the original NotificationService.createNotification.
   */
  async enqueueNotification(
    userId: string,
    role: string,
    title: string,
    message: string,
    type: string,
    entityType?: string,
    entityId?: string,
  ): Promise<void> {
    try {
      await this.notificationsQueue.add(
        'create-notification',
        {
          userId,
          role,
          title,
          message,
          type,
          entityType,
          entityId,
        },
        {
          jobId: `notif:${userId}:${type}:${Date.now()}`,
          removeOnComplete: 100,
          removeOnFail: 1000,
        },
      );
      this.logger.debug(
        `Enqueued notification of type ${type} for user ${userId}`,
      );
    } catch (err) {
      // We log but do NOT throw to ensure business flows don't crash
      this.logger.error(
        `Failed to enqueue notification for user ${userId}: ${err.message}`,
        err.stack,
      );
    }
  }
}
