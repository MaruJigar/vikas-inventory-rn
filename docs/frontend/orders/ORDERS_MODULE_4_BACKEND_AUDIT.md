# Orders Module 4 — Backend Contract Audit

## Endpoint: `PATCH /orders/:id/cancel`

### Verification 1: Exact DTO

```ts
export class CancelOrderDto {
  cancellationReason: string;
}
```

### Verification 2: Response shape

The endpoint returns the updated `Order` entity.
```ts
{
  "id": "uuid",
  "order_number": "ORD-20260621-123456",
  "status": "CANCELLED",
  "cancelled_at": "2026-06-21T14:17:00Z",
  "cancelled_by_user_id": "uuid",
  "cancellation_reason": "Customer requested cancellation",
  // ... other order fields
}
```

### Verification 3: Business rules

- **Statuses that can cancel:** `CREATED`, `CONFIRMED`, `PROCESSING`, `PACKED`, `DISPATCHED` (except for SALESMAN, who can only cancel pre-dispatch).
- **Statuses that cannot cancel:** `DELIVERED`, `CANCELLED`.

### Verification 4: RBAC

| Role | Allowed | Restrictions |
|---|---|---|
| `SUPER_ADMIN` | Yes | All orders |
| `DISTRIBUTOR_ADMIN` | Yes | Own ecosystem only |
| `SALESMAN` | Yes | Own orders only. Pre-dispatch only. |
| `MANUFACTURER_ADMIN` | No | `ForbiddenException` |

### Verification 5: Error responses

- **403 Forbidden:**
  - `{"statusCode": 403, "message": "Not your order", "error": "Forbidden"}`
  - `{"statusCode": 403, "message": "Unauthorized role", "error": "Forbidden"}`
- **409 / 400 Bad Request (Business Logic):**
  - `{"statusCode": 400, "message": "Order already cancelled", "error": "Bad Request"}`
  - `{"statusCode": 400, "message": "Cannot cancel a delivered order", "error": "Bad Request"}`
  - `{"statusCode": 400, "message": "Salesman can only cancel orders before dispatch", "error": "Bad Request"}`
- **404 Not Found:**
  - `{"statusCode": 404, "message": "Order not found", "error": "Not Found"}`
