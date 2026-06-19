import { redactSecrets } from './secret-redaction.util';

describe('Secret Redaction Utility', () => {
  it('should redact sensitive top-level keys', () => {
    const input = {
      username: 'admin',
      password: 'supersecretpassword',
      email: 'admin@example.com',
      accessToken: 'jwt-token-123',
    };

    const result = redactSecrets(input);

    expect(result.username).toBe('admin');
    expect(result.email).toBe('admin@example.com');
    expect(result.password).toBe('[REDACTED]');
    expect(result.accessToken).toBe('[REDACTED]');
  });

  it('should redact sensitive nested keys', () => {
    const input = {
      user: {
        id: 1,
        details: {
          secretKey: 'my-secret',
          publicInfo: 'info',
        },
        pass: 'shortpass',
      },
      arrayTest: [{ normal: 'value', authorization: 'Bearer 123' }],
    };

    const result = redactSecrets(input);

    expect(result.user.id).toBe(1);
    expect(result.user.details.publicInfo).toBe('info');
    expect(result.user.details.secretKey).toBe('[REDACTED]');
    expect(result.user.pass).toBe('[REDACTED]');
    expect(result.arrayTest[0].normal).toBe('value');
    expect(result.arrayTest[0].authorization).toBe('[REDACTED]');
  });

  it('should handle primitives and nulls', () => {
    expect(redactSecrets(null)).toBeNull();
    expect(redactSecrets(undefined)).toBeUndefined();
    expect(redactSecrets('string')).toBe('string');
    expect(redactSecrets(123)).toBe(123);
  });
});
