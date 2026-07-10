import type { TFunction } from 'i18next';

import { colors } from '@/theme';
import type { BackorderStatus } from '@/features/backorders/types';

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
export function backorderStatusLabel(t: TFunction, status: BackorderStatus): string {
  return t(`backorders.status.${status}`, { defaultValue: status });
}

/** A backorder still awaiting stock — the only state that can be resolved. */
export function isResolvable(status: BackorderStatus): boolean {
  return status === 'OPEN' || status === 'PARTIALLY_ALLOCATED';
}
