import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().positive(),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  ADMIN_PANEL_URL: z.string().url().optional(),
  REACT_NATIVE_WEB_URL: z.string().url().optional(),
  UPLOAD_ROOT: z.string().default('storage/uploads'),
  APP_BASE_URL: z.string().url().optional(), // Used to construct invoice download URLs (e.g. https://api.avchousehold.com)

  RATE_LIMIT_TTL: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  AUTH_RATE_LIMIT_TTL: z.coerce.number().default(60000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(5),

  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_TOKEN: z.string().optional(),

  QUEUE_ENABLED: z.coerce.boolean().default(false),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),

  SUPER_ADMIN_NAME: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PHONE: z.string().optional(),
  SUPER_ADMIN_PASSWORD: z.string().optional(),

  MANUFACTURER_ADMIN_EMAIL: z.string().email().optional(),
  MANUFACTURER_ADMIN_PASSWORD: z.string().optional(),

  DISTRIBUTOR_ADMIN_EMAIL: z.string().email().optional(),
  DISTRIBUTOR_ADMIN_PASSWORD: z.string().optional(),

  SALESMAN_EMAIL: z.string().email().optional(),
  SALESMAN_PASSWORD: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Environment validation failed');
  }

  return parsed.data;
}
