import type { TFunction } from 'i18next';
import type Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '@/theme';
import { toNum } from '@/features/orders/constants';
import type { InventoryItem, MovementType } from '@/types/inventory';

/** Adjustable movement types, in the order they're offered in the form. */
export const MOVEMENT_TYPES: MovementType[] = [
  'OPENING_STOCK',
  'STOCK_ADDED',
  'STOCK_REMOVED',
  'STOCK_CORRECTED',
  'MANUAL_ADJUSTMENT',
];

/**
 * Types that mean stock LEAVING. The backend stores `quantity_change` as a
 * signed delta and does no interpretation, so the client decides the sign —
 * the user always types a positive quantity.
 */
export function isOutwardMovement(type: MovementType): boolean {
  return type === 'STOCK_REMOVED';
}

/** Signed delta to send for a user-entered positive quantity. */
export function signedDelta(type: MovementType, quantity: number): number {
  return isOutwardMovement(type) ? -Math.abs(quantity) : Math.abs(quantity);
}

/** Translate a movement type, falling back to the raw value — order-driven
 * movements can carry types outside the adjustable enum. */
export function movementLabel(t: TFunction, type: string): string {
  return t(`inventory.movement.${type}`, { defaultValue: type });
}

/** Green for stock in, red for stock out, muted for a net-zero correction. */
export function movementColor(quantityChange: number): string {
  if (quantityChange > 0) return colors.success;
  if (quantityChange < 0) return colors.danger;
  return colors.textMuted;
}

/** "+12" / "−4" — a signed, unit-less delta for the ledger. */
export function formatDelta(quantityChange: number): string {
  if (quantityChange > 0) return `+${quantityChange}`;
  if (quantityChange < 0) return `−${Math.abs(quantityChange)}`;
  return '0';
}

/**
 * Stock health for a row's badge.
 *
 * `stock_status` is the backend's own verdict against the org-level low-stock
 * threshold — trust it for out/low. `oversold` has no server equivalent and is
 * layered on top: reserved stock exceeding what's on hand is a local warning
 * the backend doesn't model.
 */
export type StockTone = 'out' | 'low' | 'oversold' | 'ok';

export function stockTone(item: InventoryItem): StockTone {
  const available = toNum(item.available_quantity);
  const reserved = toNum(item.reserved_quantity);
  if (item.stock_status === 'OUT_OF_STOCK' || available <= 0) return 'out';
  if (reserved > available) return 'oversold';
  if (item.stock_status === 'LOW_STOCK') return 'low';
  return 'ok';
}

export function stockToneColor(tone: StockTone): string {
  switch (tone) {
    case 'out':
      return colors.danger;
    case 'low':
    case 'oversold':
      return colors.warning;
    default:
      return colors.success;
  }
}

export function stockToneIcon(
  tone: StockTone,
): keyof typeof Ionicons.glyphMap {
  switch (tone) {
    case 'out':
      return 'alert-circle-outline';
    case 'low':
      return 'trending-down-outline';
    case 'oversold':
      return 'warning-outline';
    default:
      return 'checkmark-circle-outline';
  }
}

/** Case-insensitive match over the fields a distributor would search by. */
export function matchesInventorySearch(
  item: InventoryItem,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const name = item.product?.name?.toLowerCase() ?? '';
  const sku = item.product?.sku?.toLowerCase() ?? '';
  return name.includes(q) || sku.includes(q);
}
