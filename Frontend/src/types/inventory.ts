/**
 * Mirrors the backend inventory module (Backend/src/inventory).
 *
 * The app is distributor-facing, so these types describe the DISTRIBUTOR side:
 * `distributor_inventory` rows and their `inventory_movements` ledger. The
 * backend scopes every response to the caller's own distributor from the token
 * — there is no distributor_id to pass.
 */

/** Numeric columns arrive as strings over JSON — coerce before maths. */
type Num = number | string;

/**
 * Movement kinds accepted by `POST /inventory/adjust` (backend `MovementType`).
 * Order-driven movements written by the order flow may carry other values, so
 * read paths widen this to `string`.
 */
export type MovementType =
  | 'OPENING_STOCK'
  | 'STOCK_ADDED'
  | 'STOCK_REMOVED'
  | 'STOCK_CORRECTED'
  | 'MANUAL_ADJUSTMENT';

/**
 * The product columns joined onto an inventory row. `GET /inventory` does a
 * `leftJoinAndSelect('inv.product')` — plain columns only, so `category` and
 * `manufacturer` relations are NOT included.
 */
export interface InventoryProductRef {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  product_image_url: string | null;
  mrp: Num;
  distributor_id: string | null;
  manufacturer_id: string | null;
  is_active: boolean;
}

/**
 * Stock health computed server-side on every `GET /inventory` row: out of stock
 * first, then at-or-below the configured low-stock threshold, else normal.
 */
export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL';

/**
 * `GET`/`PATCH /v1/inventory/settings`. The threshold is org-level (stored on
 * the distributor row), so it applies to every product they stock.
 */
export interface InventorySettings {
  low_stock_threshold: number | null;
}

/**
 * `PATCH /v1/inventory/settings` body. The backend validates `IsInt, Min(1)` and
 * then stores `dto.low_stock_threshold || null` — so send `null` to clear the
 * threshold. 0 is rejected by validation, never treated as "no threshold".
 */
export interface UpdateInventorySettingsPayload {
  low_stock_threshold: number | null;
}

/** A `distributor_inventory` row (one per product the distributor stocks). */
export interface InventoryItem {
  id: string;
  distributor_id: string;
  product_id: string;
  product: InventoryProductRef | null;
  available_quantity: Num;
  reserved_quantity: Num;
  backordered_quantity: Num;
  /**
   * On a `GET /inventory` row this is the caller's ORG-level threshold
   * (`distributors.low_stock_threshold`), stamped onto every row by
   * `getInventory` — `null` until the distributor configures one, and then no
   * row is ever LOW_STOCK.
   *
   * Both this and `stock_status` are computed in that one list handler.
   * `POST /inventory/adjust` returns the bare entity instead, where this is the
   * per-row column of the same name that no DTO ever writes (always 0) and
   * `stock_status` is absent — hence optional. Only trust these on list rows.
   */
  low_stock_threshold?: Num | null;
  /** Derived by the backend from `available_quantity` vs the threshold above. */
  stock_status?: StockStatus;
  created_at: string;
  updated_at: string;
}

/** An `inventory_movements` row — the audit trail behind a quantity change. */
export interface InventoryMovementRecord {
  id: string;
  distributor_id: string;
  product_id: string;
  /** Set when the movement came from an order rather than a manual adjustment. */
  order_id: string | null;
  movement_type: MovementType | string;
  /** Signed delta: negative for stock leaving. */
  quantity_change: Num;
  previous_available_quantity: Num | null;
  new_available_quantity: Num | null;
  previous_reserved_quantity: Num | null;
  new_reserved_quantity: Num | null;
  previous_backordered_quantity: Num | null;
  new_backordered_quantity: Num | null;
  reason: string | null;
  changed_by_user_id: string | null;
  created_at: string;
}

/**
 * `POST /v1/inventory/adjust` (backend `AdjustInventoryDto`).
 *
 * `distributor_id` is deliberately absent — the backend overwrites it from the
 * token for DISTRIBUTOR_ADMIN. `quantity_change` is a **delta**, not a target:
 * send a negative number to remove stock.
 *
 * The backend also rejects any product whose `distributor_id` isn't the caller's
 * (403), so only own-created products can be adjusted — manufacturer products
 * are stocked by the order flow instead.
 */
export interface AdjustStockPayload {
  product_id: string;
  movement_type: MovementType;
  quantity_change: number;
  reason?: string;
}

/**
 * A row of `GET /v1/analytics/inventory/reports/inventory-valuation`.
 * The service already coerces to numbers, and returns a PLAIN ARRAY — no
 * pagination envelope and no query params.
 */
export interface InventoryValuationRow {
  productName: string;
  sku: string | null;
  categoryName: string | null;
  availableQuantity: number;
  reservedQuantity: number;
  mrp: number;
  stockValue: number;
}
