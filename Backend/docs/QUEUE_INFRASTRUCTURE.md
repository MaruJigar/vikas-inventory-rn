# BullMQ Queue Infrastructure

The Vikas Inventory Backend uses `BullMQ` (backed by Redis) to safely offload heavy asynchronous processing from the primary HTTP thread.

## Architecture

We utilize a single `QueueModule` which dynamically boots depending on the `QUEUE_ENABLED` environment variable.

### Production Environment (`QUEUE_ENABLED=true`)
When enabled, the module connects to the configured Redis instance. It boots up `@nestjs/bullmq` and actively consumes jobs using internal Workers (Processors). 

**Current Queues:**
- `system`: Dedicated for generalized infrastructure jobs (e.g. `audit-log-enrichment`, `analytics-recomputation`).

**Retry Policy:**
By default, all jobs inherit a strict **3-attempt** limit with **Exponential Backoff** (starting at 1 second delay). This prevents third-party API rate limits or momentary DB locks from permanently discarding jobs.

### Local Development Environment (`QUEUE_ENABLED=false`)
To prevent friction for front-end developers running the backend locally, Redis is **not** strictly required.
If `QUEUE_ENABLED=false`, the `QueueModule` safely intercepts NestJS Dependency Injection. Any service that uses `@InjectQueue('system')` will silently be handed a mock queue instead of crashing. Calls to `queue.add()` will simply no-op and log a debug message.

## Future Migration Candidates

This infrastructure was built to eventually house the following synchronous bottlenecks:
1. **Notifications (`firebase-notification`)**: Sending push notifications currently blocks the HTTP thread.
2. **Audit Logs (`audit-log`)**: Emitting database mutations to the audit log should be offloaded.
3. **Analytics Recomputation**: Currently runs entirely synchronously.

*Do not aggressively migrate critical business flows (e.g., Order Creation or Inventory Reservation) into queues unless eventually consistent data guarantees have been deeply evaluated by the product team.*
