import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('system')
export class SystemProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case 'audit-log-enrichment':
        await this.handleAuditLogEnrichment(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    return { success: true };
  }

  private async handleAuditLogEnrichment(data: any) {
    this.logger.debug(
      `Simulating audit log enrichment for payload: ${JSON.stringify(data)}`,
    );
    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.logger.debug('Audit log enrichment completed successfully.');
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully!`);
    // Future expansion: Push metrics to Prometheus here
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
    // Future expansion: Push error metrics to Prometheus here
  }
}
