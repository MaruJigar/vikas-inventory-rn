/** Mirrors the backend Backorder entity (Backend/src/order/backorder.entity.ts).
 * A backorder is the unfulfilled portion of a salesman→shop order caused by a
 * distributor stock shortfall; the distributor allocates stock against it as
 * inventory arrives (see Backend/src/inventory/backorders.service.ts). */

/** Numeric columns arrive as strings over JSON — coerce before maths. */
type Num = number | string;

/** Backorder lifecycle (plain strings — NOT the dynamic order_statuses).
 * OPEN → PARTIALLY_ALLOCATED → RESOLVED as stock is allocated; CANCELLED if the
 * underlying order is cancelled. */
export type BackorderStatus =
  | 'OPEN'
  | 'PARTIALLY_ALLOCATED'
  | 'RESOLVED'
  | 'CANCELLED';

export interface BackorderProductRef {
  id: string;
  name: string;
}

export interface BackorderShopRef {
  id: string;
  name: string;
}

export interface BackorderSalesmanRef {
  id: string;
  full_name: string;
}

/** The parent order. The backend list/detail queries join order → salesman
 * only (NOT shop), so `shop` is usually absent; kept optional for the UI. */
export interface BackorderOrderRef {
  id: string;
  order_number: string;
  shop: BackorderShopRef | null;
  salesman: BackorderSalesmanRef | null;
}

export interface Backorder {
  id: string;
  order_id: string;
  order_item_id: string | null;
  product_id: string;
  distributor_id: string;
  quantity: Num;
  status: BackorderStatus;
  resolved_quantity: Num;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  product: BackorderProductRef | null;
  order: BackorderOrderRef | null;
}

/** PATCH /v1/orders/backorders/:id/resolve — distributor allocates on-hand
 * stock against the backorder (backend `ResolveBackorderDto`). `resolved_quantity`
 * is the amount being allocated in this call (added to what's already resolved). */
export interface ResolveBackorderPayload {
  resolved_quantity: number;
  notes?: string;
}
