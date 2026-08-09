/** Distributor→Manufacturer purchase orders (Backend/src/order).
 * A distributor sends a single product payload; the backend auto-splits it into
 * one DRAFT order per manufacturer (own products group into a "self" order). */

import type { Order } from '@/types/order';

type Num = number | string;

export interface POProduct {
  productId: string;
  quantity: number;
}

/**
 * POST /v1/orders/distributor-to-manufacturer body.
 *
 * NOTE: this carries NO discount fields on purpose. `CreateDistributorManufacturerOrderDto`
 * doesn't declare any, and `createDistributorManufacturerOrder` hard-zeroes every
 * discount and stores `final_order_amount = gross_order_amount` with no GST — a
 * distributor cannot price their own purchase order. The manufacturer applies the
 * discount cascade later via `PATCH /orders/:id` (distributor edits are ignored
 * there too). Because the API's global ValidationPipe uses `whitelist: true`
 * without `forbidNonWhitelisted`, extra keys are stripped SILENTLY — sending a
 * discount here would look accepted and change nothing.
 */
export interface CreatePurchaseOrderPayload {
  products: POProduct[];
  transportMode?: string;
  idempotencyKey?: string;
}

/** The endpoint returns the array of created (DRAFT) orders. */
export type CreatePurchaseOrderResult = Order[];
