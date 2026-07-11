import type { Product } from '@/types/product';

/** Numeric DB columns arrive as strings over JSON — coerce safely. */
export const toNum = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Available units for a product. The `unit` field is used to hold the stock
 * count (e.g. "2"); when it's not numeric (e.g. "kg") there's no limit.
 */
export function availableUnits(product: Product): number | undefined {
  if (product.unit == null || product.unit === '') return undefined;
  const n = Number(product.unit);
  return Number.isFinite(n) ? n : undefined;
}

/** Per-unit distributor price (MRP less distributor + special discount, pre-GST). */
export function distributorUnitPrice(product: Product): number {
  const mrp = toNum(product.mrp);
  const discountPct =
    toNum(product.distributor_discount_percent) +
    toNum(product.special_discount_percent);
  return mrp * (1 - discountPct / 100);
}

/** Discount kinds — mirrors the backend (`NONE` | `PERCENTAGE` | `FLAT`).
 * Used for the whole-order (bill) discount. */
export type DiscountType = 'NONE' | 'PERCENTAGE' | 'FLAT';

/** An order-level discount the salesman applies to the whole cart. */
export interface BillDiscount {
  type: DiscountType;
  value: number;
}

/** Rupee value of a discount on a given basis, mirroring the backend
 * (`calcBillDiscount`: %·basis or a FLAT rupee amount), capped at the basis so
 * the preview can never go negative. */
export function discountAmount(
  type: DiscountType,
  value: number,
  basis: number,
): number {
  if (type === 'NONE' || !value || value <= 0) return 0;
  const raw = type === 'PERCENTAGE' ? (value / 100) * basis : value;
  return Math.min(basis, raw);
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface CartTotals {
  subtotal: number;
  distributorDiscount: number;
  additionalDiscount: number;
  billDiscount: number;
  gst: number;
  finalPayable: number;
  itemCount: number;
}

/**
 * Distributor cart breakdown (PRD §9.2). GST is charged on MRP per the PRD
 * worked example. This is a client-side PREVIEW — the authoritative total is
 * computed by the backend at order placement.
 */
export function computeCartTotals(
  lines: CartLine[],
  bill?: BillDiscount,
): CartTotals {
  let subtotal = 0;
  let distributorDiscount = 0;
  let additionalDiscount = 0;
  let gst = 0;
  let itemCount = 0;

  for (const { product, qty } of lines) {
    const lineMrp = toNum(product.mrp) * qty;
    subtotal += lineMrp;
    distributorDiscount += lineMrp * (toNum(product.distributor_discount_percent) / 100);
    additionalDiscount += lineMrp * (toNum(product.special_discount_percent) / 100);
    gst += lineMrp * (toNum(product.gst_percent) / 100);
    itemCount += qty;
  }

  // Whole-order discount applies on the MRP subtotal (mirrors the backend,
  // which computes the bill discount on the order gross).
  const billDiscount = discountAmount(
    bill?.type ?? 'NONE',
    bill?.value ?? 0,
    subtotal,
  );

  const finalPayable =
    subtotal - distributorDiscount - additionalDiscount - billDiscount + gst;

  return {
    subtotal,
    distributorDiscount,
    additionalDiscount,
    billDiscount,
    gst,
    finalPayable,
    itemCount,
  };
}

/** Format a rupee amount for display. */
export const formatINR = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
