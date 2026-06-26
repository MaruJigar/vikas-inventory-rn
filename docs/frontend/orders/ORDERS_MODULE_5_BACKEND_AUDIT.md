# Orders Module 5 — Backend Contract Audit

## Endpoint: `PATCH /orders/:id/status`

### 1. Exact `UpdateOrderStatusDto` shape
```typescript
export class UpdateOrderStatusDto {
  status: string; // Restricted by IsEnum
  notes?: string; // Optional string
}
```

### 2. Allowed status enum values
The endpoint strictly validates the `status` payload using `@IsEnum`:
`['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED']`
*Note: `CANCELLED` cannot be passed here, as it has its own dedicated endpoint.*

### 3. State machine validation rules
The endpoint enforces transitions using `ALLOWED_STATUS_TRANSITIONS`:
- `CREATED` → `CONFIRMED`
- `CONFIRMED` → `PROCESSING`
- `PROCESSING` → `PACKED`
- `PACKED` → `DISPATCHED`
- `DISPATCHED` → `DELIVERED`
*(Transitions to `CANCELLED` exist in the state machine dictionary but cannot be executed via this `/status` endpoint).*

### 4. Roles allowed to transition status
- `SUPER_ADMIN`
- `DISTRIBUTOR_ADMIN` (for their own orders)
- `MANUFACTURER_ADMIN` (for their ecosystem orders)
*Note: `SALESMAN` is **NOT** allowed. They are forbidden from driving fulfillment lifecycle status transitions.*

### 5. Error responses
- **400 Bad Request:** `Cannot transition order from {old_status} to {new_status}. Allowed: [...]`
- **403 Forbidden:** `Not your order` or `Unauthorized role` (if a non-authorized role attempts the endpoint, or cross-tenant access occurs).
- **404 Not Found:** `Order not found`
- **409 Conflict:** Business rule violations (like insufficient stock or concurrency) may emit a generic conflict, though the specific transitions primarily use `400` in `order.service.ts`.

### 6. Response payload shape
Returns the updated `Order` entity (including any nested relational fields that were fetched).

### 7. Whether notes field is optional
**Yes**, the `notes` field is entirely optional (`@IsOptional()`). If provided, it is saved in both `OrderStatusHistory` and `FulfillmentLog`.

### 8. Whether websocket events already exist
**Yes**. The service already emits a real-time websocket event dynamically based on the target status:
```typescript
const socketEvent = `ORDER_${dto.status}`;
this.socketGateway.broadcastToRoom(`distributor:${order.distributor_id}`, socketEvent, ...);
this.socketGateway.broadcastToRoom(`salesman:${order.salesman_id}`, socketEvent, ...);
```
