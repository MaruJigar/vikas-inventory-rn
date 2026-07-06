# Orders Module 9 — Backorders Contract Audit

## 1. Endpoints Verified
- `GET /orders/backorders` (Paginated list of backorders)
- `GET /orders/backorders/:id` (Detail lookup)
- `PATCH /orders/backorders/:id/resolve` (Allocation action)

## 2. DTOs
- **ResolveBackorderDto:** Expects `resolved_quantity` (Number, min 1) and optional `notes`.
- **Response Shape:** Returns the `Backorder` entity mapped to `PaginatedResponse`.

## 3. Human-Readable Relations
The backend explicitly populates the necessary relations:
- `product` ( yielding `name`, `sku`)
- `distributor` (yielding `business_name`)
- `order` (yielding `order_number`)
  - `order.salesman` (yielding `full_name`)

## 4. Filters & Pagination
- The endpoint supports `page` and `limit`.
- Supports filtering via `status`, `distributor_id`, `salesman_id`.
- Supports text `search` (checks product name, distributor name, salesman name).

## 5. RBAC Enforcement
- `GET` endpoints restrict responses strictly to the ownership boundary of the caller (`DISTRIBUTOR_ADMIN` sees own, `SALESMAN` sees own, `SUPER_ADMIN` sees all).
- `PATCH` resolution is strictly guarded by `@Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')`. Salesmen cannot resolve backorders.

## 6. Conclusion
The backend payload perfectly matches the UI requirements. No UUIDs need to be exposed to end users. Implementation may safely proceed.
