export const sensitiveKeys = [
  'password',
  'pass',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'secret',
  'apikey',
];

export function redactSecrets(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSecrets(item));
  }

  const redactedObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey),
    );

    if (isSensitive) {
      redactedObj[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redactedObj[key] = redactSecrets(value);
    } else {
      redactedObj[key] = value;
    }
  }

  return redactedObj;
}
