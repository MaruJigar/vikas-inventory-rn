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

/** Display name for a product's manufacturer, tolerant of the several fields the
 * backend has used (`company_name` is canonical). Falls back to the free-text
 * external name for distributor-created products. */
export function manufacturerName(product: Product): string | undefined {
  const m = product.manufacturer;
  return (
    m?.company_name ??
    m?.business_name ??
    m?.name ??
    product.external_manufacturer_name ??
    undefined
  );
}

/** Per-unit distributor price (MRP less distributor + special discount, pre-GST). */
export function distributorUnitPrice(product: Product): number {
  const mrp = toNum(product.mrp);
  const discountPct =
    toNum(product.distributor_discount_percent) +
    toNum(product.special_discount_percent);
  return mrp * (1 - discountPct / 100);
}

/**
 * Order-level discounts the salesman applies to the whole cart. Both are
 * percentages; the backend applies them sequentially (special on the amount
 * left after the standard discount) — see `computeCartTotals`.
 */
export interface OrderDiscount {
  standardPercent: number;
  specialPercent: number;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface CartTotals {
  subtotal: number;
  standardDiscount: number;
  specialDiscount: number;
  finalPayable: number;
  itemCount: number;
}

/**
 * Cart total preview, mirroring the backend `createOrder` pricing
 * (Backend/src/order/order.service.ts): gross = Σ(MRP × qty), then the
 * order-level standard discount is taken off the gross, and the special
 * discount is taken off what remains (sequential, NOT both on gross). No GST
 * is added on order creation. This is a client-side PREVIEW — the authoritative
 * total is computed by the backend at order placement.
 */
export function computeCartTotals(
  lines: CartLine[],
  discount?: OrderDiscount,
): CartTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const { product, qty } of lines) {
    subtotal += toNum(product.mrp) * qty;
    itemCount += qty;
  }

  // Percentages are clamped to 0–100.
  const standardPercent = Math.min(100, Math.max(0, discount?.standardPercent ?? 0));
  const specialPercent = Math.min(100, Math.max(0, discount?.specialPercent ?? 0));

  const standardDiscount = (standardPercent / 100) * subtotal;
  const afterStandard = subtotal - standardDiscount;
  const specialDiscount = (specialPercent / 100) * afterStandard;
  const finalPayable = subtotal - standardDiscount - specialDiscount;

  return {
    subtotal,
    standardDiscount,
    specialDiscount,
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
