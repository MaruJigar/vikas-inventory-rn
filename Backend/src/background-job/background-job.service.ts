import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackgroundJob } from './background-job.entity';
import { BackgroundJobQueryDto } from './dto/background-job-query.dto';

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
      } catch (err: any) {
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

  async getPerformanceReport(queryDto: BackgroundJobQueryDto = {} as any) {
    const { page = 1, limit = 20, job_type, status, startDate, endDate } = queryDto;
    const skip = (page - 1) * limit;

    const baseQb = this.jobRepo.createQueryBuilder('job');
    if (job_type) baseQb.andWhere('job.job_type = :job_type', { job_type });
    if (status) baseQb.andWhere('job.status = :status', { status });
    if (startDate) baseQb.andWhere('job.created_at >= :startDate', { startDate });
    if (endDate) baseQb.andWhere('job.created_at <= :endDate', { endDate });

    // Summary counts by status
    const statusCountsRaw = await this.jobRepo
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(job.id)', 'count')
      .addSelect('AVG(job.attempts)', 'avg_attempts')
      .groupBy('job.status')
      .getRawMany();

    const summary = {
      totalJobs: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageAttempts: 0,
      averageDurationSeconds: 0,
    };

    let totalAttemptsSum = 0;
    for (const row of statusCountsRaw) {
      const count = Number(row.count) || 0;
      summary.totalJobs += count;
      totalAttemptsSum += (Number(row.avg_attempts) || 0) * count;

      if (row.status === 'PENDING') summary.pending = count;
      if (row.status === 'PROCESSING') summary.processing = count;
      if (row.status === 'COMPLETED') summary.completed = count;
      if (row.status === 'FAILED') summary.failed = count;
    }
    summary.averageAttempts = summary.totalJobs > 0 ? Number((totalAttemptsSum / summary.totalJobs).toFixed(2)) : 0;

    // Average duration of completed jobs
    const durationRaw = await this.jobRepo
      .createQueryBuilder('job')
      .select('AVG(EXTRACT(EPOCH FROM (job.completed_at - job.started_at)))', 'avg_duration')
      .where('job.status = :cStatus', { cStatus: 'COMPLETED' })
      .andWhere('job.started_at IS NOT NULL')
      .andWhere('job.completed_at IS NOT NULL')
      .getRawOne();

    summary.averageDurationSeconds = Number(Number(durationRaw?.avg_duration || 0).toFixed(2));

    // Distribution by job_type
    const typeDistributionRaw = await this.jobRepo
      .createQueryBuilder('job')
      .select('job.job_type', 'job_type')
      .addSelect('COUNT(job.id)', 'count')
      .groupBy('job.job_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    const jobTypeDistribution = typeDistributionRaw.map((r) => ({
      jobType: r.job_type,
      count: Number(r.count),
    }));

    // Daily execution trend (past 14 days or filtered period)
    const trendQb = this.jobRepo
      .createQueryBuilder('job')
      .select('DATE(job.created_at)', 'date')
      .addSelect('COUNT(job.id)', 'total')
      .addSelect("SUM(CASE WHEN job.status = 'COMPLETED' THEN 1 ELSE 0 END)", 'completed')
      .addSelect("SUM(CASE WHEN job.status = 'FAILED' THEN 1 ELSE 0 END)", 'failed')
      .groupBy('DATE(job.created_at)')
      .orderBy('date', 'DESC')
      .limit(30);

    const trendsRaw = await trendQb.getRawMany();
    const dailyTrends = trendsRaw.reverse().map((t) => ({
      date: t.date,
      total: Number(t.total),
      completed: Number(t.completed || 0),
      failed: Number(t.failed || 0),
    }));

    // Paginated list of jobs (sanitized - excluding sensitive payload content)
    const listQb = baseQb.clone();
    listQb
      .select([
        'job.id',
        'job.job_type',
        'job.status',
        'job.attempts',
        'job.max_attempts',
        'job.scheduled_at',
        'job.started_at',
        'job.completed_at',
        'job.failed_at',
        'job.error_message',
        'job.created_at',
      ])
      .orderBy('job.created_at', 'DESC');

    const [data, total] = await listQb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      summary,
      jobTypeDistribution,
      dailyTrends,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
