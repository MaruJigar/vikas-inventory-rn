# Request Logging

The Vikas Inventory Backend implements structured request logging and unique request correlation IDs for complete observability of the API traffic.

## Request Lifecycle
1. **Correlation ID Generation:** When an HTTP request enters the server, the `requestIdMiddleware` generates a unique UUID `requestId`.
2. **Context Binding:** The `requestId` is attached to the `Express.Request` object and can be accessed anywhere the request context is available.
3. **Response Header:** The middleware immediately appends the `x-request-id` header to the HTTP response.
4. **Interception:** The `LoggingInterceptor` monitors the request's journey.
5. **JSON Log Output:** When the request completes (or errors), the interceptor outputs a single, structured JSON log indicating success/failure, time taken, and the authenticated user context.

## Structured Log Format
Logs are emitted via the standard NestJS `Logger` but formatted as a JSON string for easy parsing by future logging infrastructure (e.g., Datadog, ELK).

### Success Payload Example
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/v1/orders",
  "statusCode": 201,
  "responseTimeMs": 45,
  "userId": "123",
  "role": "SALESMAN",
  "distributorId": "456"
}
```

### Error Payload Example
```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/v1/users",
  "statusCode": 403,
  "responseTimeMs": 12,
  "errorName": "ForbiddenException"
}
```

## Security & Data Protection
- Request bodies, parameters, and JWT contents are intentionally excluded from logs to prevent PII and secrets leakage.
- For deep payload debugging in the future, developers must ensure the `secret-redaction.util.ts` is explicitly called to clean payloads before emission.

## Client Integration
Frontend applications and API consumers can use the `x-request-id` response header for bug reports. In the case of an error, support engineers can use this ID to trace the exact lifecycle and failure point in the backend logs.
