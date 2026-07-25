import type { TFunction } from 'i18next';

import { colors } from '@/theme';

/** Badge colour for a shop's verification status (PENDING/VERIFIED/REJECTED). */
export function shopStatusColor(status: string | null | undefined): string {
  const s = (status ?? '').toUpperCase();
  if (s.includes('VERIF')) return colors.success;
  if (s.includes('REJECT')) return colors.danger;
  return colors.warning; // PENDING / unknown
}

/** Translate a verification status, falling back to the raw value. */
export function shopStatusLabel(
  t: TFunction,
  status: string | null | undefined,
): string {
  const s = (status ?? '').toUpperCase();
  return t(`shops.status.${s}`, { defaultValue: status ?? '' });
}
