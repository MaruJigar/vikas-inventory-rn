/** Mirrors the backend Backorder entity (Backend/src/order/backorder.entity.ts).
 * A backorder is the unfulfilled portion of a salesman→shop order caused by a
 * distributor stock shortfall; the distributor resolves it as stock arrives. */

/** Numeric columns arrive as strings over JSON — coerce before maths. */
type Num = number | string;

/** Backorder lifecycle (plain strings — NOT the dynamic order_statuses). */
export type BackorderStatus =
  | 'OPEN'
  | 'PARTIALLY_ALLOCATED'
  | 'RESOLVED'
  | 'CANCELLED';

export interface BackorderProductRef {
  id: string;
  name: string;
}

export interface BackorderOrderRef {
  id: string;
  order_number: string;
  salesman: { id: string; full_name: string } | null;
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
  distributor: { id: string; business_name: string } | null;
  order: BackorderOrderRef | null;
}

/** PATCH /v1/orders/backorders/:id/resolve — distributor allocates stock. */
export interface ResolveBackorderPayload {
  resolved_quantity: number;
  notes?: string;
}
