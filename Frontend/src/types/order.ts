/** Mirrors the backend Order/OrderItem entities (Backend/src/order). */

export type OrderStatus =
  | 'PENDING'
  | 'CREATED'
  | 'CONFIRMED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'PACKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

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
  item_discount_amount: Num;
  net_line_amount: Num;
  status: string;
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
  status: OrderStatus;
  shop_id: string;
  shop: OrderShopRef | null;
  salesman: { id: string; full_name: string } | null;
  distributor: { id: string; business_name: string } | null;
  gross_order_amount: Num;
  total_product_discount_amount: Num;
  bill_discount_amount: Num;
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
}

/** A row from GET /orders/:id/status-history. */
export interface OrderStatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
}
