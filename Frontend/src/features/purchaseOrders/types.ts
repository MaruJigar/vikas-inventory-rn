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
