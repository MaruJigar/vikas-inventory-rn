# Orders Module 6 — Backend Contract Audit

## Endpoints
1. `GET /orders/:id/revisions`
2. `GET /orders/:id/status-history`

### 1. Exact response DTO shape

**Revisions:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "revision_number": 1,
  "old_data": {},
  "new_data": {},
  "changed_fields": {},
  "changed_by_user_id": "uuid", // <--- UUID only
  "changed_by_role": "SALESMAN",
  "order_status_at_time": "CREATED",
  "inventory_impact": {},
  "distributor_notified": false,
  "reason": "String",
  "created_at": "2026-06-21T00:00:00Z"
}
```

**Status History:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "old_status": "CREATED",
  "new_status": "CONFIRMED",
  "changed_by_user_id": "uuid", // <--- UUID only
  "reason": "String",
  "created_at": "2026-06-21T00:00:00Z"
}
```

### 2. Pagination contract
Both endpoints utilize the standard `PaginatedResponse` shape. They accept `page` and `limit` queries and return exactly:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### 3. Sort order
- **Revisions**: `revision_number: 'ASC'` (Chronological)
- **Status History**: `created_at: 'ASC'` (Chronological)

### 4. Human-readable fields available
**BLOCKER IDENTIFIED:** The backend does **not** join the `User` entity. Neither endpoint returns a human-readable name for the user who performed the action.

### 5. User information available
Only `changed_by_user_id` (a UUID) and `changed_by_role` are available.

### 6. Timestamp fields available
Both provide `created_at`.

### 7. Empty state behavior
Returns `{ data: [], meta: { ... total: 0 } }`.

### 8. Query parameters accepted
`page` (default 1), `limit` (default 20). 

### 9. Meta pagination object shape
Standard meta block with `page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPreviousPage`.

### 10. UUIDs requiring transformation
**BLOCKER IDENTIFIED:**
Because `changed_by_user` relation is not populated via `leftJoinAndSelect` in `order.service.ts` for either `findAndCount` operation, the frontend only receives the `changed_by_user_id` UUID.

According to Human Readability Governance:
> UUIDs must never appear. If backend only provides IDs: STOP. Document blocker. Do not render IDs.

**Action Required:** We cannot proceed to Phase 2 (Implementation) until the backend `order.service.ts` is updated to include the `changed_by_user` relation for both history endpoints, otherwise we will violate governance by either showing UUIDs or providing no user attribution for edits.
