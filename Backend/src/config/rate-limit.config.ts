import { registerAs } from '@nestjs/config';

export const rateLimitConfig = registerAs('rateLimit', () => ({
  global: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL as string, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
  },
  auth: {
    ttl: parseInt(process.env.AUTH_RATE_LIMIT_TTL as string, 10) || 60000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX as string, 10) || 5,
  },
}));
