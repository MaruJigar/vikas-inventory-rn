/** Distributor→Manufacturer purchase orders (Backend/src/order).
 * A distributor sends a single product payload; the backend auto-splits it into
 * one DRAFT order per manufacturer (own products group into a "self" order). */

import type { Order } from '@/types/order';

type Num = number | string;

export interface POProduct {
  productId: string;
  quantity: number;
}

/** POST /v1/orders/distributor-to-manufacturer body. */
export interface CreatePurchaseOrderPayload {
  products: POProduct[];
  standardDiscountPercent?: number;
  specialDiscountPercent?: number;
  transportMode?: string;
  idempotencyKey?: string;
}

/** The endpoint returns the array of created (DRAFT) orders. */
export type CreatePurchaseOrderResult = Order[];

/** One suggested reorder line from POST /orders/purchase-request/generate. */
export interface PurchaseRequestItem {
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  manufacturer_name_snapshot: string | null;
  quantity: Num;
  mrp: Num;
  gross_line_amount: Num;
}

/** POST /orders/purchase-request/generate response (read-only suggestion). */
export interface PurchaseRequestSuggestion {
  items: PurchaseRequestItem[];
  gross_order_amount: Num;
  total_quantity: Num;
}
