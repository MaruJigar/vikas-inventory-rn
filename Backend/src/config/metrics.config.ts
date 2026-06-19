import { registerAs } from '@nestjs/config';

export const metricsConfig = registerAs('metrics', () => ({
  enabled: process.env.METRICS_ENABLED !== 'false', // defaults to true unless explicitly false
  token: process.env.METRICS_TOKEN || '',
}));
