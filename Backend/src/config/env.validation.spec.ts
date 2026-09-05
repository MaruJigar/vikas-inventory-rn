import { validateEnv } from './env.validation';

describe('Environment Validation', () => {
  it('should validate correctly with valid env variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASS: 'postgres',
      DB_NAME: 'test_db',
      JWT_SECRET: 'super-secret-key-that-is-at-least-32-chars-long',
    };

    const parsed = validateEnv(validEnv);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.PORT).toBe(3000);
    expect(parsed.DB_PORT).toBe(5432);
    expect(parsed.DB_HOST).toBe('localhost');
  });

  it('should throw error if required variables are missing', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      // Missing DB variables and JWT_SECRET
    };

    expect(() => validateEnv(invalidEnv)).toThrow(
      'Environment validation failed',
    );
  });

  it('should throw error if JWT_SECRET is too short', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASS: 'postgres',
      DB_NAME: 'test_db',
      JWT_SECRET: 'short', // Too short
    };

    expect(() => validateEnv(invalidEnv)).toThrow(
      'Environment validation failed',
    );
  });
});
