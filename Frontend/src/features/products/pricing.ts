import type { Product } from '@/types/product';

/** Numeric DB columns arrive as strings over JSON — coerce safely. */
export const toNum = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Per-unit distributor price (MRP less distributor + special discount, pre-GST). */
export function distributorUnitPrice(product: Product): number {
  const mrp = toNum(product.mrp);
  const discountPct =
    toNum(product.distributor_discount_percent) +
    toNum(product.special_discount_percent);
  return mrp * (1 - discountPct / 100);
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface CartTotals {
  subtotal: number;
  distributorDiscount: number;
  additionalDiscount: number;
  gst: number;
  finalPayable: number;
  itemCount: number;
}

/**
 * Distributor cart breakdown (PRD §9.2). GST is charged on MRP per the PRD
 * worked example. This is a client-side PREVIEW — the authoritative total is
 * computed by the backend at order placement.
 */
export function computeCartTotals(lines: CartLine[]): CartTotals {
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

  const finalPayable = subtotal - distributorDiscount - additionalDiscount + gst;

  return {
    subtotal,
    distributorDiscount,
    additionalDiscount,
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
