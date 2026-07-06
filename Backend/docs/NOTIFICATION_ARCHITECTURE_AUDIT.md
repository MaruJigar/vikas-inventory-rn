# Notification Architecture Audit

This document investigates the current state of asynchronous candidates, specifically focusing on notifications, socket events, and their blast radius on critical business paths.

## Current Notification Flows
The system currently utilizes `NotificationService.createNotification()` which is injected into several core business services.
The following notification types are explicitly sent:
1. **`BACKORDER_RESOLVED_ALERT`**: Triggered in `BackordersService.allocateBackorder` when a backorder reaches fully resolved status.
2. **`[ROLE]_APPROVED` / `[ROLE]_REJECTED`**: Triggered in `ApprovalService.reviewRequest` for Salesmen, Distributors, and Manufacturers.
3. **`LINK_REQUEST_APPROVED` / `LINK_REQUEST_REJECTED`**: Triggered in `ApprovalService.reviewRequest` when ecosystem linking occurs.

### Execution Paradigm
Every single notification flow is currently **SYNCHRONOUS**.
The business service actively `await`s the notification creation, which subsequently writes to the `notifications` table, fires off a database Audit Log, and executes a WebSocket broadcast.

## Firebase Notification Flows
**Status: Empty Shell.**
While `FirebaseNotificationModule` exists in the codebase, it is entirely empty. No push notifications are currently being dispatched to mobile devices. 

## Socket Event Flows
`AppSocketGateway` is heavily utilized across the platform:
- `NOTIFICATION_CREATED` (via `NotificationService`)
- `NOTIFICATION_READ` (via `NotificationService`)
- `backorder:allocated` / `backorder:resolved` (via `BackordersService`)
- `inventory:updated` (via `BackordersService`)
- `APPROVAL_STATUS_CHANGED` (via `ApprovalService`)

**Safety:** These socket events are strictly **informational** and execute a fire-and-forget `this.server.to(room).emit()`.

## Business-Critical Dependencies & Risks
There is a **massive architectural risk** currently lingering in the codebase regarding how notifications are handled:

In both `BackordersService` and `ApprovalService`, notifications are triggered **immediately after** the `queryRunner.commitTransaction()` executes. 
Because `NotificationService.createNotification` is executed synchronously without a local `try/catch` wrapper, if the notification database write fails (e.g. database timeout), an unhandled exception is thrown. 
**The Result:** The client receives a `500 Internal Server Error`, yet the business transaction (e.g., Backorder Allocation or User Approval) successfully persisted to the database. If the client blindly retries the API call due to the 500 error, they will hit "Request already processed" exceptions.

## Safe Queue Candidates
**ALL** current `NotificationService.createNotification()` calls are incredibly safe—and highly recommended—to queue immediately. 
By moving notification dispatches to BullMQ, we instantly eliminate the post-transaction `500` error risk. The business logic will simply push a JSON payload to Redis and return a fast HTTP 200, while the queue worker handles the `notification` database write and socket broadcasts asynchronously.

## Unsafe Queue Candidates
Currently, there are no notifications that fundamentally require synchronous delivery. The client can safely receive a successful HTTP response and wait 50-100ms for the corresponding WebSocket/Notification to appear.

## Recommended Migration Order
To successfully utilize our new BullMQ infrastructure without breaking existing endpoints:
1. **Refactor `NotificationService`**: Create a `NotificationProcessor` attached to a new `notifications` queue.
2. **Migrate Services**: Alter `BackordersService` and `ApprovalService` to call `this.notificationQueue.add()` instead of `NotificationService.createNotification()`.
3. **Audit Logging**: Move `AuditLogService.logAction` to a dedicated queue worker (the `system` queue proof-of-concept) to further reduce API latency.
