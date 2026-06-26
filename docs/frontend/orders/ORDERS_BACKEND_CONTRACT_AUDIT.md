# Orders Backend Contract Audit

**Generated:** 2026-06-21  
**Role:** Senior Frontend Architect  
**Scope:** `Backend/src/order/` — Read-only investigation. No code written.  
**Verified against:** `order.controller.ts`, `order.service.ts`, all DTOs, all entities

---

## Table of Contents

1. [Endpoint Inventory](#1-endpoint-inventory)
2. [Request DTOs](#2-request-dtos)
3. [Response Shapes](#3-response-shapes)
4. [Order Status Lifecycle](#4-order-status-lifecycle)
5. [RBAC Matrix](#5-rbac-matrix)
6. [Business Rules](#6-business-rules)
7. [Dependency Map](#7-dependency-map)
8. [Revision History](#8-revision-history)
9. [Cancel Order Workflow](#9-cancel-order-workflow)
10. [Edit Order Workflow](#10-edit-order-workflow)
11. [Inventory Mechanics](#11-inventory-mechanics)
12. [WebSocket Events](#12-websocket-events)
13. [UI Implications](#13-ui-implications)
14. [Risks & Issues Found](#14-risks--issues-found)
15. [Missing APIs](#15-missing-apis)

---

## 1. Endpoint Inventory

**Source:** `order.controller.ts` L34–L102

All routes are under: `GET|POST|PATCH /v1/orders`  
Global guards: `JwtAuthGuard`, `RolesGuard` — ALL endpoints require auth token.

| # | Method | Path | Controller Method | Service Method | Roles |
|---|--------|------|-------------------|----------------|-------|
| 1 | `POST` | `/orders` | `createOrder` | `createOrder` | `SUPER_ADMIN`, `SALESMAN` |
| 2 | `GET` | `/orders` | `getOrders` | `getOrders` | All authenticated |
| 3 | `GET` | `/orders/:id` | `getOrderById` | `getOrderById` | All authenticated |
| 4 | `PATCH` | `/orders/:id` | `updateOrder` | `updateOrder` | `SUPER_ADMIN`, `SALESMAN` |
| 5 | `PATCH` | `/orders/:id/cancel` | `cancelOrder` | `cancelOrder` | `SUPER_ADMIN`, `SALESMAN`, `DISTRIBUTOR_ADMIN` |
| 6 | `GET` | `/orders/:id/revisions` | `getRevisions` | `getOrderRevisions` | All authenticated |

> **Note:** No `DELETE` endpoint exists. Orders are never hard-deleted. Soft delete is not implemented on `Order` (DeleteDateColumn exists on entity but service never calls `softDelete`).

---

## 2. Request DTOs

### 2.1 `POST /orders` — `CreateOrderDto`

**Source:** `dto/create-order.dto.ts`

```typescript
class OrderProductDto {
  productId: string;         // @IsUUID() — REQUIRED
  quantity: number;          // @IsNumber() @Min(0.01) — REQUIRED
  itemDiscountType?: string; // @IsEnum(['NONE','PERCENTAGE','FLAT']) — OPTIONAL, default 'NONE'
  itemDiscountValue?: number; // @IsNumber() @Min(0) — OPTIONAL, default 0
}

class CreateOrderDto {
  visitId: string;              // @IsUUID() — REQUIRED
  shopId: string;               // @IsUUID() — REQUIRED
  products: OrderProductDto[];  // @IsArray() @ValidateNested — REQUIRED, min 1 item
  billDiscountType?: string;    // @IsEnum(['NONE','PERCENTAGE','FLAT']) — OPTIONAL
  billDiscountValue?: number;   // @IsNumber() @Min(0) — OPTIONAL
  isOfflineCreated?: boolean;   // @IsBoolean() — OPTIONAL
  idempotencyKey?: string;      // @IsString() — OPTIONAL, for offline deduplication
}
```

**Example payload:**
```json
{
  "visitId": "550e8400-e29b-41d4-a716-446655440000",
  "shopId": "660e8400-e29b-41d4-a716-446655440001",
  "products": [
    {
      "productId": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 10,
      "itemDiscountType": "PERCENTAGE",
      "itemDiscountValue": 5
    },
    {
      "productId": "880e8400-e29b-41d4-a716-446655440003",
      "quantity": 2,
      "itemDiscountType": "NONE"
    }
  ],
  "billDiscountType": "FLAT",
  "billDiscountValue": 50,
  "isOfflineCreated": false,
  "idempotencyKey": "mobile-uuid-xyz-123"
}
```

---

### 2.2 `PATCH /orders/:id` — `UpdateOrderDto`

**Source:** `dto/update-order.dto.ts` L14–L36

```typescript
class UpdateOrderDto {
  products: OrderProductDto[]; // @IsArray() @ValidateNested — REQUIRED (full replacement)
  billDiscountType?: string;   // @IsEnum(['NONE','PERCENTAGE','FLAT']) — OPTIONAL
  billDiscountValue?: number;  // @IsNumber() @Min(0) — OPTIONAL
  reason?: string;             // @IsString() — OPTIONAL, logged to revision
}
```

> **CRITICAL:** `products` is a **full replacement array**, not a patch. Every product in the new order must be sent in every edit.

---

### 2.3 `PATCH /orders/:id/cancel` — `CancelOrderDto`

**Source:** `dto/update-order.dto.ts` L38–L42

```typescript
class CancelOrderDto {
  cancellationReason: string; // @IsString() — REQUIRED, no min length enforced
}
```

---

### 2.4 `GET /orders` — `ListQueryDto`

**Source:** `common/dto/list-query.dto.ts`

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `page` | number | 1 | — | Page number |
| `limit` | number | 20 | 100 | Records per page |
| `search` | string | — | — | Searches `order_number ILIKE` only |
| `sortBy` | string | `created_at` | — | Allowed: `created_at`, `updated_at`, `total_amount`, `order_number` |
| `sortOrder` | `ASC\|DESC` | `DESC` | — | Sort direction |
| `status` | string | — | — | Exact match on `order.status` |
| `salesman_id` | string (UUID) | — | — | Filters `order.salesman_id` |
| `shop_id` | string (UUID) | — | — | Filters `order.shop_id` |
| `startDate` | ISO date string | — | — | `order.created_at >=` |
| `endDate` | ISO date string | — | — | `order.created_at <=` |

> **Note:** `salesman_id`, `shop_id` are extracted via `...filters` spread from `queryDto as any`. They are NOT declared in `ListQueryDto`. They work only because of the `as any` cast on L807 of `order.service.ts`. They will pass class-validator unvalidated.

---

## 3. Response Shapes

### 3.1 `GET /orders` — Paginated List

**Source:** `order.service.ts` L887–L900 + entity relations at L810–L813

```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-20250621-482910",
      "visit_id": "uuid",
      "shop_id": "uuid",
      "salesman_id": "uuid",
      "distributor_id": "uuid",
      "manufacturer_id": null,
      "status": "CREATED",
      "gross_order_amount": "1000.00",
      "total_product_discount_amount": "50.00",
      "bill_discount_type": "FLAT",
      "bill_discount_value": "50.00",
      "bill_discount_amount": "50.00",
      "final_order_amount": "900.00",
      "total_quantity": "12.00",
      "total_backordered_quantity": "0.00",
      "is_offline_created": false,
      "idempotency_key": null,
      "post_dispatch_edited": false,
      "post_delivery_edited": false,
      "cancelled_at": null,
      "cancelled_by_user_id": null,
      "cancellation_reason": null,
      "created_at": "2025-06-21T03:30:00.000Z",
      "updated_at": "2025-06-21T03:30:00.000Z",
      "deleted_at": null,
      "shop": {
        "id": "uuid",
        "name": "Metro Store",
        "owner_name": "Rajesh Kumar",
        "phone": "9876543210",
        "address": "123 Main Street"
      },
      "salesman": {
        "id": "uuid",
        "full_name": "Ravi Sharma",
        "phone": "9123456789",
        "email": "ravi@example.com"
      },
      "distributor": {
        "id": "uuid",
        "business_name": "Sharma Distributors Pvt Ltd",
        "email": "sharma@dist.com"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 340,
    "totalPages": 17,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

> **Relations injected:** `shop`, `salesman`, `distributor` via `leftJoinAndSelect` (L810–L813).  
> **NOT injected in list:** `items`, `revisions`, `status_history`.

---

### 3.2 `GET /orders/:id` — Single Order

**Source:** `order.service.ts` L906–L914

Same shape as list item above. Same three relations: `shop`, `salesman`, `distributor`.  
`items`, `revisions`, `status_history` are **NOT** included.

> **CRITICAL GAP:** There is no endpoint that returns an order with its line items. The frontend must call `GET /orders/:id` to get the order header and has NO API to fetch the associated `order_items` records. See [Missing APIs](#15-missing-apis).

---

### 3.3 `POST /orders` — Created Order

**Source:** `order.service.ts` L436: `return savedOrder;`

Returns the bare `Order` entity. **Relations are NOT populated** (`shop`, `salesman`, `distributor` are undefined). Only scalar fields and FK columns are returned.

```json
{
  "id": "uuid",
  "order_number": "ORD-20250621-482910",
  "visit_id": "uuid",
  "shop_id": "uuid",
  "salesman_id": "uuid",
  "distributor_id": "uuid",
  "status": "CREATED",
  "gross_order_amount": "1000.00",
  "total_product_discount_amount": "50.00",
  "bill_discount_type": "FLAT",
  "bill_discount_value": "50.00",
  "bill_discount_amount": "50.00",
  "final_order_amount": "900.00",
  "total_quantity": "12.00",
  "total_backordered_quantity": "0.00",
  "is_offline_created": false,
  "post_dispatch_edited": false,
  "created_at": "2025-06-21T03:30:00.000Z",
  "updated_at": "2025-06-21T03:30:00.000Z"
}
```

---

### 3.4 `PATCH /orders/:id/cancel` — Cancelled Order

**Source:** `order.service.ts` L788: `return this.orderRepo.findOne({ where: { id: order.id } });`

Returns a bare `Order` entity with no relations populated.

```json
{
  "id": "uuid",
  "order_number": "ORD-20250621-482910",
  "status": "CANCELLED",
  "cancelled_at": "2025-06-21T04:00:00.000Z",
  "cancelled_by_user_id": "uuid",
  "cancellation_reason": "Customer declined",
  ...
}
```

---

### 3.5 `PATCH /orders/:id` — Updated Order

**Source:** `order.service.ts` L630: `return manager.getRepository(Order).findOne({ where: { id: order.id } })`

Returns a bare `Order` entity (same as cancel — no relations). Line items are NOT returned.

---

### 3.6 `GET /orders/:id/revisions` — Revision History Array

**Source:** `order.service.ts` L923–L927

```typescript
return this.revisionRepo.find({
  where: { order_id: orderId },
  order: { revision_number: 'ASC' },
});
```

Returns an array (NOT paginated) of `OrderRevision` records.

```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "revision_number": 1,
    "old_data": {
      "gross_order_amount": "800.00",
      "final_order_amount": "750.00",
      "total_quantity": "10.00"
    },
    "new_data": {
      "gross_order_amount": "1000.00",
      "final_order_amount": "900.00",
      "total_quantity": "12.00"
    },
    "changed_fields": null,
    "changed_by_user_id": "uuid",
    "changed_by_role": "SALESMAN",
    "order_status_at_time": "CREATED",
    "inventory_impact": null,
    "distributor_notified": false,
    "reason": "Customer added more items",
    "created_at": "2025-06-21T03:45:00.000Z"
  }
]
```

---

## 4. Order Status Lifecycle

**Source:** `order.service.ts` L31–L39

```
const ORDER_STATUSES = [
  'CREATED',       ← Initial state on createOrder
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
];

const PRE_DISPATCH_STATUSES = ['CREATED', 'CONFIRMED', 'PROCESSING', 'PACKED'];
```

### 4.1 Lifecycle Diagram

```
CREATED ──► CONFIRMED ──► PROCESSING ──► PACKED ──► DISPATCHED ──► DELIVERED
   │              │              │            │
   └──────────────┴──────────────┴────────────┴──► CANCELLED
                                                   (any pre-DISPATCHED status,
                                                    SALESMAN only pre-dispatch;
                                                    DISTRIBUTOR_ADMIN any time before DELIVERED)
```

### 4.2 Transition Rules (from service code)

| Transition | Who triggers it | API | Code evidence |
|-----------|----------------|-----|---------------|
| `→ CREATED` | SALESMAN (auto on create) | `POST /orders` | L285: `status: 'CREATED'` |
| `CREATED → CANCELLED` | SALESMAN or DISTRIBUTOR_ADMIN | `PATCH /orders/:id/cancel` | L668–L685 |
| `CONFIRMED → CANCELLED` | SALESMAN or DISTRIBUTOR_ADMIN | `PATCH /orders/:id/cancel` | PRE_DISPATCH_STATUSES includes CONFIRMED |
| `DISPATCHED → CANCELLED` | DISTRIBUTOR_ADMIN only | `PATCH /orders/:id/cancel` | L679–L683 (no status restriction for DISTRIBUTOR_ADMIN) |
| Status transitions (CONFIRMED, PROCESSING, PACKED, DISPATCHED, DELIVERED) | **Not implemented in any endpoint** | — | No `updateStatus` or fulfillment endpoint exists in controller |

> **CRITICAL GAP:** `CONFIRMED`, `PROCESSING`, `PACKED`, `DISPATCHED`, `DELIVERED` statuses have **no backend endpoint** to transition to them. The `ORDER_STATUSES` constant exists, `FulfillmentLog` entity exists, but the fulfillment service / controller that would drive these transitions is commented out or not yet implemented. See `order.service.ts` L791: `// ─── Fulfillment transitions ──────────────────────────────────────────────`.

---

## 5. RBAC Matrix

**Source:** `order.controller.ts` `@Roles()` decorators, `order.service.ts` role checks

| Operation | SUPER_ADMIN | MANUFACTURER_ADMIN | DISTRIBUTOR_ADMIN | SALESMAN |
|-----------|:-----------:|:------------------:|:-----------------:|:--------:|
| Create Order | ✅ | ❌ | ❌ | ✅ (must be APPROVED) |
| List Orders | ✅ (all) | ✅ (linked distributors' orders) | ✅ (own distributor) | ✅ (own orders) |
| Get Order By ID | ✅ | ✅ (ecosystem only) | ✅ (own distributor) | ✅ (own orders) |
| Edit Order | ✅ | ❌ | ❌ | ✅ (own + not CANCELLED/DELIVERED) |
| Cancel Order | ✅ | ❌ | ✅ (own distributor, before DELIVERED) | ✅ (own, pre-dispatch only) |
| Get Revisions | ✅ | ✅ (ecosystem) | ✅ (own distributor) | ✅ (own) |

### 5.1 Ownership Enforcement Details

**SUPER_ADMIN** (`verifyOrderOwnership` L123): No restriction, sees all orders globally.

**DISTRIBUTOR_ADMIN** (`verifyOrderOwnership` L124–L128):
```typescript
const dist = await this.getDistributorOrFail(userId);
if (order.distributor_id !== dist.id) throw ForbiddenException('Not your order');
```

**MANUFACTURER_ADMIN** (`verifyOrderOwnership` L130–L140):
```typescript
const mfr = await this.mfrRepo.findOne({ where: { user_id: userId } });
const linked = await this.mfrDistRepo.findOne({
  where: { manufacturer_id: mfr.id, distributor_id: order.distributor_id }
});
if (!linked) throw ForbiddenException('Not in your ecosystem');
```
Manufacturers can see orders from any distributor linked to them via `manufacturer_distributors` table.

**SALESMAN** (`verifyOrderOwnership` L142–L148):
```typescript
const salesman = await this.salesmanRepo.findOne({ where: { user_id: userId } });
if (!salesman || salesman.id !== order.salesman_id)
  throw ForbiddenException('Not your order');
```
Salesman only sees orders they personally created.

### 5.2 Create Order: Salesman Approval Gate

**Source:** `order.service.ts` L107–L108
```typescript
if (salesman.approval_status !== 'APPROVED')
  throw new ForbiddenException('Salesman is not approved');
```
Even if a salesman has a valid JWT, they cannot create orders unless `approval_status === 'APPROVED'`.

---

## 6. Business Rules

**Source:** `order.service.ts` — all rules verified against code

### 6.1 Create Order Prerequisites

| Rule | Code Location |
|------|--------------|
| Caller must be a SALESMAN with `approval_status = 'APPROVED'` | L101–L109 |
| `visitId` must exist and belong to the salesman | L167–L170 |
| The visit must have `status = 'ACTIVE'` | L171–L172 |
| `shopId` must exist and belong to the salesman's distributor | L175–L178 |
| `shopId` must match `visit.shop_id` | L179–L180 |
| At least one product required | L182–L183 |
| Products must exist in the `products` table | L203–L207 |
| Idempotency: if `idempotencyKey` provided and already exists, returns existing order without creating new | L159–L163 |

### 6.2 Amount Calculation

**Source:** `order.service.ts` L79–L99, L209–L218, L269–L276

```
grossLineAmount  = product.mrp × quantity
itemDiscount     = calcItemDiscount(itemDiscountType, itemDiscountValue, grossLineAmount)
netLineAmount    = grossLineAmount - itemDiscount

grossOrderAmount = Σ netLineAmount (all items)
billDiscount     = calcBillDiscount(billDiscountType, billDiscountValue, grossOrderAmount)
finalOrderAmount = grossOrderAmount - billDiscount
```

**Discount type behaviour (calcItemDiscount L79–L88):**
- `'NONE'` or missing → discount = 0
- `'PERCENTAGE'` → discount = (discountValue / 100) × grossAmount
- `'FLAT'` → discount = discountValue (fixed ₹ amount)

**Important:** `grossOrderAmount` is computed as the **sum of netLineAmounts** (post item-discount), NOT sum of grossLineAmounts.

### 6.3 Inventory Reservation at Order Creation

**Source:** `order.service.ts` L223–L266

For each product:
1. Query `DistributorInventory` with pessimistic write lock for `distributor_id` + `product_id`
2. `availableQty = inv.available_quantity` (0 if no inventory record)
3. `reservable = min(availableQty, requestedQty)`
4. `backorderQty = requestedQty - reservable`
5. Increment `reserved_quantity` by `reservable`
6. Create `Backorder` record if `backorderQty > 0`

**OrderItem statuses set at creation:**
- `backorderQty > 0 && reservable === 0` → `'BACKORDERED'`
- Otherwise → `'RESERVED'`

### 6.4 Edit Order Rules

**Source:** `order.service.ts` L441–L450

```typescript
if (order.salesman_id !== salesman.id) throw ForbiddenException('Not your order');
if (order.status === 'CANCELLED' || order.status === 'DELIVERED')
  throw BadRequestException('Cannot edit a cancelled or delivered order');
```

| Condition | Behaviour |
|-----------|-----------|
| Status is CANCELLED or DELIVERED | Rejected with 400 |
| Status is pre-dispatch (CREATED, CONFIRMED, PROCESSING, PACKED) | Full edit: items deleted, re-created, inventory re-allocated |
| Status is post-dispatch (DISPATCHED) | Post-dispatch edit: items replaced but inventory **not** re-allocated; `post_dispatch_edited = true` |

### 6.5 Cancel Order Rules

**Source:** `order.service.ts` L654–L685

| Role | Restriction | Code |
|------|-------------|------|
| `SALESMAN` | Only own orders; only if status is in PRE_DISPATCH_STATUSES | L668–L678 |
| `DISTRIBUTOR_ADMIN` | Only own distributor's orders; can cancel at any status before DELIVERED | L679–L683 |
| `SUPER_ADMIN` | No restrictions (falls through to else, which would throw — **BUG: SUPER_ADMIN cannot cancel**) | L683 |
| `MANUFACTURER_ADMIN` | Cannot cancel (no role check — falls through to else) | L683 |

> **BUG FOUND:** `cancelOrder` service has no branch for `SUPER_ADMIN`. At L683: `else { throw ForbiddenException('Unauthorized role') }`. The controller declares `@Roles('SUPER_ADMIN', 'SALESMAN', 'DISTRIBUTOR_ADMIN')` at L76, but the service logic will reject `SUPER_ADMIN` with a ForbiddenException.

On cancellation, the service:
1. Releases all `reserved_quantity` back to `available_quantity`
2. Decrements `backordered_quantity`
3. Sets all Backorder records to `'CANCELLED'`
4. Sets all OrderItem statuses to `'CANCELLED'`
5. Sets order `status = 'CANCELLED'`, records `cancelled_at`, `cancelled_by_user_id`, `cancellation_reason`
6. Creates OrderStatusHistory record
7. Emits `ORDER_CANCELLED` socket event to both `distributor:` and `salesman:` rooms

---

## 7. Dependency Map

**Source:** `order.service.ts` constructor imports and validation logic

```
createOrder requires:
├── ShopVisit     → visitId must exist, status='ACTIVE', owned by salesman
├── Shop          → shopId must exist, belongs to salesman's distributor, matches visit.shop_id
├── Salesman      → caller must exist and be approval_status='APPROVED'
├── Product       → each productId must exist
└── DistributorInventory → queried per product (pessimistic lock)

getOrders (MANUFACTURER_ADMIN) requires:
└── ManufacturerDistributor → to find linked distributor_ids

updateOrder requires:
└── Salesman      → caller must be salesman who placed the order

cancelOrder requires:
├── Salesman      (if SALESMAN role)
└── Distributor   (if DISTRIBUTOR_ADMIN role)
```

---

## 8. Revision History

**Source:** `order.service.ts` L596–L628, `order-revision.entity.ts`

### When created:
Only `updateOrder` (edit) creates revisions. Cancel does NOT create a revision — it creates a `OrderStatusHistory` record instead.

### Revision content:

```typescript
{
  order_id: order.id,
  revision_number: (count + 1),
  old_data: { ...entireOrderObjectBeforeEdit },
  new_data: {
    gross_order_amount,
    total_product_discount_amount,
    bill_discount_type,
    bill_discount_value,
    bill_discount_amount,
    final_order_amount,
    total_quantity,
    total_backordered_quantity,
    post_dispatch_edited
  },
  changed_by_user_id: userId,
  changed_by_role: 'SALESMAN',  // hardcoded as 'SALESMAN' — not dynamic
  order_status_at_time: order.status,
  reason: dto.reason || null,
  distributor_notified: false,
  // changed_fields: null (not computed)
  // inventory_impact: null (not computed)
}
```

> **Note:** `changed_fields` and `inventory_impact` columns exist on the entity but are set to `null`/not populated by the service. `changed_by_role` is hardcoded `'SALESMAN'` regardless of actual caller role.

### Retrieval:

`GET /orders/:id/revisions` — returns ALL revisions, sorted ASC by `revision_number`. **Not paginated.** An order with many edits will return all of them in a single response.

---

## 9. Cancel Order Workflow

**Source:** `order.service.ts` L652–L789, `order.controller.ts` L75–L90

```
PATCH /orders/:id/cancel
Body: { "cancellationReason": "string" }

Validations:
1. Order must exist
2. Order must not be 'CANCELLED' (400 if already cancelled)
3. Order must not be 'DELIVERED' (400 if already delivered)
4. Role-based ownership check (see RBAC section)
5. SALESMAN: status must be in PRE_DISPATCH_STATUSES

On success:
1. For each order item:
   a. Decrement distributor inventory reserved_quantity
   b. Increment distributor inventory available_quantity (return to pool)
   c. Log InventoryMovement type='ORDER_CANCELLED'
   d. If backordered: decrement backordered_quantity, mark Backorder as 'CANCELLED'
   e. Mark OrderItem status='CANCELLED'
2. Update Order: status='CANCELLED', cancelled_at, cancelled_by_user_id, cancellation_reason
3. Create OrderStatusHistory record
4. Emit socket: ORDER_CANCELLED to distributor:{id} and salesman:{id} rooms

Returns: bare Order entity (no relations)
```

---

## 10. Edit Order Workflow

**Source:** `order.service.ts` L441–L649, `order.controller.ts` L63–L73

```
PATCH /orders/:id
Body: UpdateOrderDto (full product array replacement)

Validations:
1. Caller must be an APPROVED SALESMAN
2. Must be the salesman who created the order (order.salesman_id === salesman.id)
3. Status must NOT be 'CANCELLED' or 'DELIVERED'

isPostDispatch = status NOT IN ['CREATED','CONFIRMED','PROCESSING','PACKED']

Pre-dispatch edit:
1. Release all existing item reservations from inventory
2. Cancel open Backorder records for existing items
3. Delete all existing OrderItems
4. Re-create items (same as create flow: reserve, backorder)
5. Recalculate all amounts
6. Update Order record
7. Create OrderRevision

Post-dispatch edit (status is DISPATCHED):
1. Delete existing OrderItems (no inventory changes)
2. Re-create items (no inventory allocation — reservable = qty, backorder = 0)
3. Recalculate amounts
4. Set post_dispatch_edited = true
5. Create OrderRevision
6. Update Order record

Returns: bare Order entity (no relations, no items)
Side effects: audit log (ORDER_EDITED) + socket (ORDER_EDITED to distributor room)
```

---

## 11. Inventory Mechanics

**Source:** `order.service.ts` L223–L368

### Tables involved:
- `distributor_inventory` — tracks `available_quantity`, `reserved_quantity`, `backordered_quantity`
- `inventory_movements` — log of every movement (type enum: `ORDER_RESERVED`, `ORDER_BACKORDERED`, `ORDER_CANCELLED`)
- `backorders` table — one record per product line that could not be fully reserved

### Inventory movement types logged:

| Movement Type | When |
|---------------|------|
| `ORDER_RESERVED` | Product quantity reserved on create/edit |
| `ORDER_BACKORDERED` | Product quantity exceeded available stock |
| `ORDER_CANCELLED` | Reservation returned on cancellation |

### Backorder status values (entity default: `'OPEN'`):

| Status | Set When |
|--------|----------|
| `OPEN` | Created during order creation |
| `CANCELLED` | Order cancelled or item's backorder released during edit |

---

## 12. WebSocket Events

**Source:** `order.service.ts` L396–L434, L640–L647, L769–L786

All events emitted to `AppSocketGateway`.

| Event Name | Room | Payload | Triggered By |
|-----------|------|---------|-------------|
| `NEW_ORDER` | `distributor:{distributor_id}` | `{ orderId, shopId, salesmanId, grossAmount, timestamp }` | createOrder |
| `BACKORDER_CREATED` | `distributor:{distributor_id}` | `{ orderId, backordered_quantity }` | createOrder (if any backorders) |
| `ORDER_EDITED` | `distributor:{distributor_id}` | `{ orderId, timestamp }` | updateOrder |
| `ORDER_CANCELLED` | `distributor:{distributor_id}` | `{ orderId, reason, timestamp }` | cancelOrder |
| `ORDER_CANCELLED` | `salesman:{salesman_id}` | `{ orderId, reason, timestamp }` | cancelOrder |

---

## 13. UI Implications

### 13.1 Orders List Page

- **Pagination:** Server-side. `page`, `limit` (max 100).
- **Filters available via query params:** `status`, `salesman_id`, `shop_id`, `startDate`, `endDate`
- **Search:** Only searches `order_number`. Not shop name, salesman name, or amount.
- **Relations available in list:** `shop.name`, `salesman.full_name`, `distributor.business_name`
- **Relations NOT available:** `items` (line items)

### 13.2 Order Detail Page / Drawer

- `GET /orders/:id` returns the same shape as the list item (header + 3 relations)
- **Order line items are NOT returned by any endpoint.** UI cannot show product breakdown without a missing API.
- Revision history available via separate `GET /orders/:id/revisions` call (all revisions, not paginated)

### 13.3 Order Creation (Admin Panel)

- Only `SALESMAN` role can create via UI. `SUPER_ADMIN` is allowed by controller `@Roles` but:
  - The service calls `getSalesmanOrFail(userId)` which will throw `ForbiddenException('Only salesmen can perform this action')` for SUPER_ADMIN
  - **SUPER_ADMIN cannot create orders even though controller allows it**

### 13.4 Status Badge Display

| Status | Display Suggestion |
|--------|-------------------|
| `CREATED` | Blue / Pending |
| `CONFIRMED` | Indigo / Confirmed |
| `PROCESSING` | Amber / In Progress |
| `PACKED` | Orange / Packed |
| `DISPATCHED` | Teal / Dispatched |
| `DELIVERED` | Green / Completed |
| `CANCELLED` | Red / Cancelled |

### 13.5 Edit Button Visibility

Show edit button only when:
- Role is `SALESMAN` AND
- Order is **not** `CANCELLED` or `DELIVERED`

### 13.6 Cancel Button Visibility

| Role | Show Cancel When |
|------|-----------------|
| SALESMAN | Own order, status in `['CREATED','CONFIRMED','PROCESSING','PACKED']` |
| DISTRIBUTOR_ADMIN | Own distributor's order, status not `CANCELLED` or `DELIVERED` |
| SUPER_ADMIN | **Do NOT show** — service will throw despite controller allowing it (see bugs) |

### 13.7 Backorder Indicator

- `order.total_backordered_quantity > 0` → show backorder warning badge
- Individual item backordered qty is in `order_items` (inaccessible from current API)

### 13.8 Offline Order Indicator

- `order.is_offline_created === true` → show offline indicator on order card

---

## 14. Risks & Issues Found

### 14.1 CRITICAL — SUPER_ADMIN Cannot Cancel Orders

**File:** `order.service.ts` L654–L685  
**Issue:** `cancelOrder` has no branch for `'SUPER_ADMIN'` role. Falls to `else { throw ForbiddenException('Unauthorized role') }`.  
Controller allows it: `@Roles('SUPER_ADMIN', 'SALESMAN', 'DISTRIBUTOR_ADMIN')` (L76).  
**Impact:** Admin UI cancel button will return 403 for SUPER_ADMIN.

### 14.2 CRITICAL — SUPER_ADMIN Cannot Create Orders

**File:** `order.service.ts` L101–L109  
**Issue:** `createOrder` calls `getSalesmanOrFail(userId)` which throws for any non-SALESMAN user.  
Controller allows it: `@Roles('SUPER_ADMIN', 'SALESMAN')` (L41).  
**Impact:** SUPER_ADMIN cannot create orders despite controller permission.

### 14.3 HIGH — Order Items Not Exposed by Any API

**File:** `order.controller.ts`, `order.service.ts`  
**Issue:** No endpoint returns `order_items`. `GET /orders/:id` only returns the header.  
**Impact:** Cannot display product line breakdown on order detail UI.

### 14.4 HIGH — Status Transition Endpoints Missing

**File:** `order.service.ts` L791: comment `// ─── Fulfillment transitions ──────────────────────────────────────────────`  
**Issue:** `CONFIRMED`, `PROCESSING`, `PACKED`, `DISPATCHED`, `DELIVERED` statuses exist in constants but NO API can set them. `FulfillmentLog` entity exists, never written to.  
**Impact:** Status lifecycle UI is incomplete. Progress tracking is impossible.

### 14.5 MEDIUM — search Only Searches order_number

**File:** `order.service.ts` L853–L856  
**Issue:** `search` param only does `order.order_number ILIKE`. Cannot search by shop name, salesman name, or amount.  
**Impact:** Users searching for a shop's orders must use `shop_id` filter, not free text.

### 14.6 MEDIUM — Revisions Not Paginated

**File:** `order.service.ts` L923–L927  
**Issue:** `GET /orders/:id/revisions` returns all revisions in one call.  
**Impact:** High-traffic orders with many edits will produce large unbounded responses.

### 14.7 MEDIUM — Unvalidated Filter Params

**File:** `order.service.ts` L806–L807: `...filters` from `queryDto as any`  
**Issue:** `salesman_id` and `shop_id` filters bypass class-validator (not declared in `ListQueryDto`). No UUID validation. Sending invalid UUIDs will cause PostgreSQL errors.

### 14.8 LOW — changed_by_role Hardcoded as 'SALESMAN'

**File:** `order.service.ts` L623  
**Issue:** `changed_by_role: 'SALESMAN'` is hardcoded. If SUPER_ADMIN could edit (not currently possible), role would still be logged as 'SALESMAN'.

### 14.9 LOW — Order Number Not Guaranteed Unique Under High Concurrency

**File:** `order.service.ts` L72–L77  
**Issue:** `generateOrderNumber()` uses `Math.random()` (6-digit). DB has `unique: true` on `order_number` column but no retry logic. Under high concurrency, will throw a DB constraint error.

### 14.10 LOW — POST /orders returns unpopulated entity

**File:** `order.service.ts` L436  
**Issue:** `createOrder` returns `savedOrder` directly from the transaction manager, not re-fetched with relations. Frontend cannot read `shop.name`, `salesman.full_name` etc. immediately after creation.

---

## 15. Missing APIs

The following capabilities are required for a complete Orders UI but have **no backend endpoint**:

| # | Required Feature | Missing API |
|---|-----------------|------------|
| 1 | View order line items | `GET /orders/:id/items` |
| 2 | Move order to CONFIRMED | `PATCH /orders/:id/status` or fulfillment endpoint |
| 3 | Move order to PROCESSING | Same |
| 4 | Move order to PACKED | Same |
| 5 | Move order to DISPATCHED | Same |
| 6 | Move order to DELIVERED | Same |
| 7 | View order status history | `GET /orders/:id/status-history` |
| 8 | View backorders for an order | `GET /orders/:id/backorders` |
| 9 | Resolve a backorder | `PATCH /backorders/:id/resolve` |
| 10 | View fulfillment logs | `GET /orders/:id/fulfillment-logs` |
| 11 | Search orders by shop name | Requires backend search expansion |
| 12 | Search orders by salesman name | Requires backend search expansion |
| 13 | Export orders (CSV/PDF) | No endpoint |

---

## 16. Entity Summary

### `orders` table columns

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | No | PK |
| `order_number` | varchar(100) | No | Unique, format `ORD-YYYYMMDD-NNNNNN` |
| `visit_id` | uuid | No | FK → shop_visits |
| `shop_id` | uuid | No | FK → shops |
| `salesman_id` | uuid | No | FK → salesmen |
| `distributor_id` | uuid | No | FK → distributors |
| `manufacturer_id` | uuid | Yes | FK → manufacturers (rarely populated) |
| `status` | varchar(50) | No | Default: `'CREATED'` |
| `gross_order_amount` | numeric(12,2) | No | Sum of net line amounts |
| `total_product_discount_amount` | numeric(12,2) | No | Sum of item discounts |
| `bill_discount_type` | varchar(50) | No | Default: `'NONE'` |
| `bill_discount_value` | numeric(12,2) | No | Input discount value |
| `bill_discount_amount` | numeric(12,2) | No | Computed discount amount |
| `final_order_amount` | numeric(12,2) | No | `gross - bill_discount` |
| `total_quantity` | numeric(12,2) | No | Sum of all item quantities |
| `total_backordered_quantity` | numeric(12,2) | No | Sum of backordered qtys |
| `is_offline_created` | boolean | No | Default: false |
| `idempotency_key` | varchar(200) | Yes | Unique (partial index) |
| `post_dispatch_edited` | boolean | No | Default: false |
| `post_delivery_edited` | boolean | No | Default: false |
| `cancelled_at` | timestamp | Yes | |
| `cancelled_by_user_id` | uuid | Yes | FK → users |
| `cancellation_reason` | text | Yes | |
| `created_at` | timestamp | No | Auto |
| `updated_at` | timestamp | No | Auto |
| `deleted_at` | timestamp | Yes | Soft delete column (never used) |

### `order_items` table columns

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | No | PK |
| `order_id` | uuid | No | FK → orders |
| `product_id` | uuid | No | FK → products |
| `product_name_snapshot` | varchar(200) | No | Snapshotted at creation |
| `sku_snapshot` | varchar(100) | Yes | Snapshotted at creation |
| `manufacturer_name_snapshot` | varchar(200) | Yes | Snapshotted at creation |
| `quantity` | numeric(12,2) | No | |
| `mrp` | numeric(12,2) | No | Snapshotted from product.mrp |
| `gross_line_amount` | numeric(12,2) | No | `mrp × qty` |
| `item_discount_type` | varchar(50) | No | Default: `'NONE'` |
| `item_discount_value` | numeric(12,2) | No | Default: 0 |
| `item_discount_amount` | numeric(12,2) | No | Computed |
| `net_line_amount` | numeric(12,2) | No | `gross - discount` |
| `reserved_quantity` | numeric(12,2) | No | Default: 0 |
| `backordered_quantity` | numeric(12,2) | No | Default: 0 |
| `dispatched_quantity` | numeric(12,2) | No | Default: 0 |
| `delivered_quantity` | numeric(12,2) | No | Default: 0 |
| `status` | varchar(50) | No | Default: `'ORDERED'`; set to `'RESERVED'`, `'BACKORDERED'`, or `'CANCELLED'` |

---

*End of audit. Every finding above maps directly to source code. No assumptions made.*
R e m e d i a t i o n   a p p l i e d .   V i e w   O R D E R S _ C O N T R A C T _ V 2 . m d   f o r   n e w   A P I   c o n t r a c t .  
 