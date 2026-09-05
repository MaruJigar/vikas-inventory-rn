# Global API Error Handling

The Vikas Inventory Backend implements a strictly normalized error structure. Regardless of where an error originates—be it validation failures, TypeORM database conflicts, or custom business logic exceptions—it will always adhere to a single predictable contract.

## The Standard Error Contract

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Human readable message or array of messages",
  "code": "VALIDATION_ERROR",
  "requestId": "uuid",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/v1/orders"
}
```

## Standard Error Codes (`code`)
The API uses a stable, bounded set of error codes for clients to branch their logic against:
- `VALIDATION_ERROR` (e.g., DTO missing required fields)
- `BAD_REQUEST` (e.g., generic malformed inputs or foreign key misses)
- `UNAUTHORIZED` (e.g., missing JWT token)
- `FORBIDDEN` (e.g., insufficient RBAC roles)
- `NOT_FOUND` (e.g., resource does not exist)
- `CONFLICT` (e.g., trying to register an email already in use, or Postgres unique violation)
- `RATE_LIMIT` (e.g., exceeded quota)
- `DATABASE_ERROR` (e.g., database unavailable)
- `INTERNAL_ERROR` (e.g., unknown system failures)

## Production vs Development
The `GlobalExceptionFilter` masks internal implementation details securely.
- **In Development/Test (`NODE_ENV=development`)**: The `message` field may contain raw Postgres driver error details or complete stack hints to aid debugging.
- **In Production (`NODE_ENV=production`)**: Unhandled exceptions and raw database SQL injection hints are aggressively stripped. The `message` field falls back to generic safe text (e.g., `"A resource with these unique properties already exists"`).

## Client Workflow (Request IDs)
Because every error payload includes the `requestId`, client developers and QA testers can immediately supply this UUID to the backend engineering team when reporting an issue. The backend team can use this `requestId` to search the structured JSON logs and instantly correlate the API failure with the deep backend trace.
