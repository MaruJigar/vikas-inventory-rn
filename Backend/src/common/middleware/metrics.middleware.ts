import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Ignore the metrics endpoint itself to prevent observation loops
    if (req.originalUrl === '/metrics') {
      return next();
    }

    const startTime = process.hrtime();
    const method = req.method;

    res.on('finish', () => {
      const statusCode = res.statusCode;
      
      // Use route.path if available (matched route) to prevent cardinality explosion,
      // otherwise fallback to the URL but mask IDs or simply use 'unmatched_route'
      const route = req.route ? req.route.path : 'unmatched_route';

      // 1. Increment total requests
      this.metricsService.httpRequestTotal.labels(method, route, statusCode.toString()).inc();

      // 2. Calculate and record duration
      const diff = process.hrtime(startTime);
      const durationSeconds = diff[0] + diff[1] / 1e9;
      this.metricsService.httpRequestDurationSeconds.labels(method, route).observe(durationSeconds);

      // 3. Increment errors if 4xx or 5xx
      if (statusCode >= 400) {
        this.metricsService.httpErrorsTotal.labels(route, statusCode.toString()).inc();
      }
    });

    next();
  }
}
