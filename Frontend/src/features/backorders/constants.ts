import type { TFunction } from 'i18next';

import { colors } from '@/theme';
import { toNum } from '@/features/orders/constants';
import type { Backorder, BackorderStatus } from '@/features/backorders/types';

/** Statuses in workflow order — used for the filter chips. */
export const BACKORDER_STATUSES: BackorderStatus[] = [
  'OPEN',
  'PARTIALLY_ALLOCATED',
  'RESOLVED',
  'CANCELLED',
];

/** Badge colour per status (same restrained palette as orders). */
export function backorderStatusColor(status: BackorderStatus): string {
  switch (status) {
    case 'RESOLVED':
      return colors.success;
    case 'CANCELLED':
      return colors.danger;
    case 'PARTIALLY_ALLOCATED':
      return colors.primary;
    default:
      return colors.warning; // OPEN
  }
}

/** Translate a status, falling back to the raw value. */
export function backorderStatusLabel(
  t: TFunction,
  status: BackorderStatus,
): string {
  return t(`backorders.status.${status}`, { defaultValue: status });
}

/** Quantity still awaiting stock (ordered − already allocated). */
export function unfulfilledQty(bo: Backorder): number {
  return toNum(bo.quantity) - toNum(bo.resolved_quantity);
}

/** A backorder can be allocated against only while stock is still owed and the
 * order is live (OPEN / PARTIALLY_ALLOCATED). */
export function isResolvable(bo: Backorder): boolean {
  return (
    (bo.status === 'OPEN' || bo.status === 'PARTIALLY_ALLOCATED') &&
    unfulfilledQty(bo) > 0
  );
}
