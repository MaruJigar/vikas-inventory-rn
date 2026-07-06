import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';
import { AppDataSource } from '../database/data-source';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: client.Registry;

  public readonly httpRequestTotal: client.Counter<
    'method' | 'route' | 'statusCode'
  >;
  public readonly httpRequestDurationSeconds: client.Histogram<
    'method' | 'route'
  >;
  public readonly httpErrorsTotal: client.Counter<'route' | 'statusCode'>;
  public readonly appHealthStatus: client.Gauge<'service'>;

  // Queue Metrics
  public readonly notificationJobsTotal: client.Counter<'type' | 'status'>;
  public readonly notificationFailuresTotal: client.Counter<'type'>;

  constructor() {
    this.registry = new client.Registry();

    // Default metrics (CPU, memory, event loop, etc.)
    client.collectDefaultMetrics({ register: this.registry });

    // Custom request counters
    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'statusCode'],
      registers: [this.registry],
    });

    // Custom duration histogram
    this.httpRequestDurationSeconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // buckets in seconds
      registers: [this.registry],
    });

    // Custom error counters
    this.httpErrorsTotal = new client.Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors (4xx and 5xx)',
      labelNames: ['route', 'statusCode'],
      registers: [this.registry],
    });

    // Simple health gauge
    this.appHealthStatus = new client.Gauge({
      name: 'app_health_status',
      help: 'Indicates the overall health of the application (1 = healthy, 0 = unhealthy)',
      labelNames: ['service'],
      registers: [this.registry],
    });

    // Notification Queue Counters
    this.notificationJobsTotal = new client.Counter({
      name: 'notification_jobs_total',
      help: 'Total number of notification jobs processed',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.notificationFailuresTotal = new client.Counter({
      name: 'notification_failures_total',
      help: 'Total number of notification job final failures',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Periodically update the health gauge based on database connectivity.
    // To keep it perfectly simple and avoid circular dependencies with HealthModule,
    // we query TypeORM's initialization state.
    setInterval(() => {
      const isHealthy = AppDataSource && AppDataSource.isInitialized ? 1 : 0;
      this.appHealthStatus.set(
        { service: 'vikas-inventory-backend' },
        isHealthy,
      );
    }, 10000); // Check every 10s
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
