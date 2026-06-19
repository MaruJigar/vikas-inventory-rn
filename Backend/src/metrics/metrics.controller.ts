import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { MetricsAuthGuard } from '../common/guards/metrics-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Observability')
@Controller({
  path: 'metrics',
  version: VERSION_NEUTRAL,
})
@UseGuards(MetricsAuthGuard)
@SkipThrottle()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Export Prometheus metrics' })
  @ApiBearerAuth('bearer') // Optional, enforced dynamically by MetricsAuthGuard
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
