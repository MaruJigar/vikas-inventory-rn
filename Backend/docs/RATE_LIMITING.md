# API Rate Limiting

The Vikas Inventory Backend uses in-memory global API rate limiting to protect endpoints from abuse, credential stuffing, and brute-force attacks.

## Throttling Levels

The backend operates with two distinct throttlers defined in `.env`:

### 1. Global Throttler (`default`)
- **Applies to:** Every authenticated and unauthenticated endpoint.
- **Variables:** `RATE_LIMIT_MAX` per `RATE_LIMIT_TTL` (in milliseconds).
- **Default:** 100 requests per minute.
- **Purpose:** Protects the platform from general scraping or accidental client-side infinite loops.

### 2. Auth Throttler (`auth`)
- **Applies to:** `/v1/auth/login` and `/v1/auth/refresh`.
- **Variables:** `AUTH_RATE_LIMIT_MAX` per `AUTH_RATE_LIMIT_TTL` (in milliseconds).
- **Default:** 5 requests per minute.
- **Purpose:** Aggressively prevents credential stuffing and brute-forcing passwords.

## Health Endpoint Exemptions
The entire `HealthController` (`/health`, `/health/live`, `/health/ready`) is aggressively exempted via the native `@SkipThrottle()` decorator.
**Why?** Orchestrators and internal VPC monitors ping these endpoints frequently. We must ensure a rate limiter never accidentally causes Kubernetes to restart a pod by returning `429 Too Many Requests` to a readiness probe.

## Standardized Error Response
When a client hits a limit, they receive our standard HTTP API error structure. No custom logic was required, because `ThrottlerException` correctly returns HTTP 429, which `GlobalExceptionFilter` seamlessly normalizes to:
```json
{
  "success": false,
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "ThrottlerException: Throttler Exception",
  "code": "RATE_LIMIT",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-06-19T10:00:00.000Z",
  "path": "/v1/auth/login"
}
```

## Future Scaling
Currently, this is strictly **in-memory** throttling suitable for a single container. If this backend scales horizontally across multiple pods/servers, the throttler will track IPs per-pod. If strict global limit parity across instances is required in the future, we must install `@nestjs/throttler-storage-redis`.
