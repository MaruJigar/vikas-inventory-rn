import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

@Injectable()
export class ConfigHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isConfigLoaded = !!this.configService.get('app.port');
    
    const result = this.getStatus(key, isConfigLoaded, {
      loaded: isConfigLoaded,
    });

    if (isConfigLoaded) {
      return result;
    }
    
    throw new HealthCheckError('Config check failed', result);
  }
}
