import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigHealthIndicator } from './indicators/config.health';

@Controller({
  path: 'health',
  version: VERSION_NEUTRAL,
})
@SkipThrottle()
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private configHealthIndicator: ConfigHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic status heartbeat' })
  checkStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe' })
  checkLiveness() {
    // A liveness probe simply confirms the node process is capable of responding to HTTP requests.
    // It purposefully avoids database checks so the orchestrator doesn't kill the pod if the DB blinks.
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe' })
  checkReadiness() {
    // A readiness probe ensures the app is fully connected to infrastructure and configuration is loaded.
    // If this fails, the load balancer temporarily removes this instance from rotation.
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.configHealthIndicator.isHealthy('configuration'),
    ]);
  }
}
