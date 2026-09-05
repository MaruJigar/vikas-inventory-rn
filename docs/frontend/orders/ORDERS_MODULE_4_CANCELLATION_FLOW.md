# Orders Module 4 — Cancellation Flow

## API Contract
- **Endpoint**: `PATCH /orders/:id/cancel`
- **Payload**:
  ```json
  {
    "cancellationReason": "Customer requested cancellation"
  }
  ```

## RBAC Matrix & Visibility Rules
| Role | Action Visibility | Backend Enforcement |
|---|---|---|
| **SALESMAN** | Visible if status NOT IN `DISPATCHED, DELIVERED, CANCELLED` | Allowed for own orders pre-dispatch |
| **DISTRIBUTOR_ADMIN** | Visible if status !== `CANCELLED` | Allowed for own ecosystem orders |
| **SUPER_ADMIN** | Visible if status !== `CANCELLED` | Allowed for all orders |
| **MANUFACTURER_ADMIN** | Hidden | `ForbiddenException` |

## Validation Rules
- **Cancellation Reason**: Required string. Minimum 5 characters, maximum 500 characters. Enforced via `zod`.

## Human Readability Proof
The `CancelOrderDialog` enforces strict human readability:
- Displays `order.order_number`
- Displays `shop.name`
- Displays `salesman.full_name`
- **NEVER** displays `order.id`, `shop_id`, `salesman_id` or any UUIDs.

## Error Handling Matrix
- **Success**: Closes drawer, invalidates `lists()` and `detail(orderId)`, triggers "Order cancelled successfully".
- **403**: Intercepted by `handleUnexpectedToast` which maps to `handlePermissionToast` ("You do not have permission to perform this action.").
- **409/400**: Intercepted by `handleUnexpectedToast` which displays the exact backend business rule message (e.g. "Order already cancelled").
- **500**: Intercepted by `handleUnexpectedToast` which displays standard fallback unexpected toast.

## UI Verification
```text
[ Cancel Order ]
This action cannot be undone. Reserved inventory will be released.

----------------------------------------
Order: ORD-23OFFZ8W
Shop: Harber, Kulas and Mueller Store
Salesman: John Doe
----------------------------------------

Cancellation Reason *
[ textarea: Enter reason for cancellation... ]
(Must be at least 5 characters)

[ Close ] [ Cancelling... ]
```
