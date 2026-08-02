/** Mirrors the backend Order/OrderItem entities (Backend/src/order). */

/**
 * A dynamic order status (Backend `order_statuses` table). Statuses are
 * admin-configurable — names are NOT a fixed enum. Orders reference one by
 * `status_id`; resolve the name/colour via the status index (see
 * `features/orders/constants.ts` + `useStatusIndex`).
 */
export interface OrderStatusRecord {
  id: string;
  name: string;
  sequence: number;
  can_cancel_order: boolean;
  isactive: boolean;
  is_cancel_status: boolean;
  is_dispatch_status: boolean;
}

/** Numeric columns arrive as strings over JSON — coerce before maths. */
type Num = number | string;

export interface OrderItem {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  manufacturer_name_snapshot: string | null;
  quantity: Num;
  mrp: Num;
  gross_line_amount: Num;
  net_line_amount: Num;
  /** Present when the backend snapshots GST on the line (edit/update path). */
  gst_percent_snapshot?: Num;
  gst_amount?: Num;
  status_id: string | null;
  /**
   * `GET /orders/:id` joins `items.product`, so the detail response carries the
   * live product. Absent on the list endpoint — always optional-chain it.
   */
  product?: { id: string; product_image_url?: string | null } | null;
}

export interface OrderShopRef {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  order_number: string;
  /** FK to `order_statuses`; list/detail endpoints do NOT join the name. */
  status_id: string | null;
  /** Only present if a future endpoint joins the relation; usually absent. */
  status?: OrderStatusRecord | null;
  shop_id: string;
  shop: OrderShopRef | null;
  /** Null for distributor→manufacturer orders (the distributor is the creator);
   * set for salesman→shop orders. Backend gates status updates on this. */
  salesman_id: string | null;
  salesman: { id: string; full_name: string } | null;
  /** Set only for distributor→manufacturer orders. */
  manufacturer_id?: string | null;
  distributor: { id: string; business_name: string } | null;
  gross_order_amount: Num;
  /** Order-level discounts (backend RefactorDiscounts): standard then special,
   * applied sequentially. Amounts are what the server computed. */
  standard_discount_percent: Num;
  standard_discount_amount: Num;
  special_discount_percent: Num;
  special_discount_amount: Num;
  total_gst_amount: Num;
  transport_mode: string | null;
  final_order_amount: Num;
  total_quantity: Num;
  cancellation_reason: string | null;
  created_at: string;
  /** Present on the detail endpoint (GET /orders/:id). */
  items?: OrderItem[];
}

/** POST /v1/orders — salesman places an order within an active visit. */
export interface CreateOrderProduct {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  visitId: string;
  shopId: string;
  products: CreateOrderProduct[];
  /** Order-level discount percentages (backend RefactorDiscounts). */
  standardDiscountPercent?: number;
  specialDiscountPercent?: number;
  transportMode?: string;
}

/** PATCH /v1/orders/:id — salesman edits a pre-dispatch order. `products`
 * fully REPLACES the order's items; discounts are preserved when omitted. */
export interface UpdateOrderPayload {
  products: CreateOrderProduct[];
  standardDiscountPercent?: number;
  specialDiscountPercent?: number;
  transportMode?: string;
  reason?: string;
}

/** A row from GET /orders/:id/status-history. Statuses are FK ids now. */
export interface OrderStatusHistoryEntry {
  id: string;
  old_status_id: string | null;
  new_status_id: string | null;
  reason: string | null;
  created_at: string;
}

/** A row from GET /orders/:id/revisions (order_revisions). `changed_fields` is
 * a jsonb map; we only surface who/when/why on the timeline. */
export interface OrderRevision {
  id: string;
  revision_number: number;
  changed_fields: Record<string, unknown> | null;
  changed_by_role: string | null;
  order_status_at_time: string | null;
  reason: string | null;
  changed_by_user: { id: string; full_name: string } | null;
  created_at: string;
}

/** A row from GET /orders/:id/fulfillment-logs (fulfillment_logs). */
export interface FulfillmentLog {
  id: string;
  action: string;
  quantity: Num | null;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  performed_by_user: { id: string; full_name: string } | null;
  created_at: string;
}
