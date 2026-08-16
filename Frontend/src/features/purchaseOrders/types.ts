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
 * doesn't declare any, and `createDistributorManufacturerOrder` forces every line to
 * `PERCENTAGE` at the distributor's own configured `distributor_discount_percent`,
 * ignoring anything the request asks for. The manufacturer adjusts the rest of the
 * cascade later via `PATCH /orders/:id` (distributor edits are ignored there too).
 * Because the API's global ValidationPipe uses `whitelist: true` without
 * `forbidNonWhitelisted`, extra keys are stripped SILENTLY — sending a discount here
 * would look accepted and change nothing.
 */
export interface CreatePurchaseOrderPayload {
  products: POProduct[];
  transportMode?: string;
  idempotencyKey?: string;
}

/** The endpoint returns the array of created (DRAFT) orders. */
export type CreatePurchaseOrderResult = Order[];

/** One priced line inside a {@link PurchaseOrderPreview}. */
export interface PurchaseOrderPreviewItem {
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  manufacturer_name_snapshot: string | null;
  quantity: number;
  mrp: Num;
  gross_line_amount: Num;
  net_line_amount: Num;
}

/**
 * One manufacturer's slice of `POST /v1/orders/distributor-to-manufacturer/preview`.
 *
 * The preview mirrors `createDistributorManufacturerOrder` exactly — same grouping
 * by manufacturer, same discount — but writes nothing. `manufacturer_id` is `null`
 * for the distributor's own products (the "self" order).
 *
 * `gross_order_amount` is the plain Σ(MRP × qty); the configured distributor
 * discount comes off it to give `final_order_amount`. GST is NOT part of a
 * purchase order (the backend never sets `total_gst_amount`).
 */
export interface PurchaseOrderPreview {
  manufacturer_id: string | null;
  gross_order_amount: Num;
  distributor_discount_percent: Num;
  distributor_discount_amount: Num;
  final_order_amount: Num;
  total_quantity: number;
  items: PurchaseOrderPreviewItem[];
}

/** The preview endpoint returns one entry per manufacturer group. */
export type PurchaseOrderPreviewResult = PurchaseOrderPreview[];
