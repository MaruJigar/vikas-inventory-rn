import type { TFunction } from 'i18next';

import { colors } from '@/theme';
import type { OrderStatus } from '@/types/order';

/** The lifecycle statuses, in order, plus terminal CANCELLED. */
export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CREATED',
  'CONFIRMED',
  'APPROVED',
  'PROCESSING',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

/** Badge colour per status (monochrome palette + restrained semantics). */
export function statusColor(status: string): string {
  switch (status) {
    case 'DELIVERED':
    case 'APPROVED':
      return colors.success;
    case 'DISPATCHED':
    case 'PACKED':
      return colors.primary;
    case 'CANCELLED':
      return colors.danger;
    default:
      return colors.warning;
  }
}

/**
 * Translate a status, falling back to the raw value for any status the backend
 * sends that we haven't mapped — never render a raw i18n key.
 */
export function statusLabel(t: TFunction, status: string): string {
  return t(`orders.status.${status}`, { defaultValue: status });
}

/** Numeric DB columns arrive as strings over JSON — coerce safely. */
export const toNum = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export const formatINR = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
