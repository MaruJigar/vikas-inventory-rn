# Notification Reliability Architecture

To eliminate the `500 Internal Server Error` risks associated with post-transaction synchronous tasks, we have decoupled Notification Delivery from the primary API request lifecycle using BullMQ.

## The Queue Flow
Business Services (e.g., `BackordersService`, `ApprovalService`) no longer inject `NotificationService` directly.
Instead, they inject `NotificationQueueService`.

1. **Commit Transaction**: The business logic successfully executes and `queryRunner.commitTransaction()` finishes.
2. **Enqueue Job**: The service calls `NotificationQueueService.enqueueNotification()`.
3. **Return 200**: The job is pushed to Redis, and the API request successfully completes.
4. **Process Job**: The `NotificationProcessor` consumes the job and executes the existing `NotificationService.createNotification()` logic safely in the background.

## Retry Strategy
The `notifications` queue operates with a hardened resilience policy:
- **Attempts**: `5`
- **Backoff**: `Exponential` (Starts at 2s delay, doubles each attempt).

*Reasoning*: Notifications involve database writes (`notifRepo.save`) and socket broadcasts. If the database experiences a momentary lock or a connection timeout, the job will self-heal by trying again a few seconds later. It prevents momentary infrastructure blips from permanently black-holing critical alerts.

## Failure Behavior
If a notification permanently fails after 5 attempts:
1. It is logged as an `error` including the original payload and `targetUserId`.
2. The `notification_failures_total` Prometheus metric is incremented.
3. The original business transaction (e.g. Backorder fulfillment) remains 100% unaffected.

## Metrics Exposed
The `MetricsService` seamlessly tracks these queue events natively via Prometheus:
- `notification_jobs_total{type="...", status="completed/failed"}`
- `notification_failures_total{type="..."}`

## Mock Compatibility
In local environments where `QUEUE_ENABLED=false`, the NestJS Dependency Injector is gracefully handed a Mock implementation of the `notifications` queue. Calls to `enqueueNotification` will simply fire a debug log and safely discard the job. **No local Redis container is required for frontend engineers.**
