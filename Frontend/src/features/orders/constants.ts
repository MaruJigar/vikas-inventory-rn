import type { TFunction } from 'i18next';

import { colors } from '@/theme';
import type { OrderStatusRecord } from '@/types/order';

/**
 * Statuses are dynamic (Backend `order_statuses`), and orders reference them by
 * `status_id` only — the list/detail endpoints don't join the name. We fetch
 * the status catalogue once (`useOrderStatuses`) and build this index to
 * resolve a `status_id` into a display name + badge colour.
 */
export interface StatusMeta {
  id: string;
  name: string;
  color: string;
  isCancel: boolean;
}

/** Build an id → {name, colour, …} lookup from the fetched status catalogue. */
export function indexStatuses(
  list: OrderStatusRecord[],
): Map<string, StatusMeta> {
  // The terminal/success status is the highest-sequence active, non-cancel one.
  const finalSeq = list
    .filter((s) => s.isactive && !s.is_cancel_status)
    .reduce((max, s) => Math.max(max, s.sequence), -Infinity);

  const map = new Map<string, StatusMeta>();
  for (const s of list) {
    let color: string = colors.warning;
    if (s.is_cancel_status) color = colors.danger;
    else if (s.sequence === finalSeq) color = colors.success;
    else if (s.is_dispatch_status) color = colors.primary;
    map.set(s.id, {
      id: s.id,
      name: s.name,
      color,
      isCancel: s.is_cancel_status,
    });
  }
  return map;
}

/**
 * Resolve a `status_id` to a display label via the index. Status names are
 * admin-defined, so translate known ones and fall back to the raw name; if the
 * id isn't in the catalogue yet, render an em-dash rather than a raw uuid.
 */
export function statusLabel(
  t: TFunction,
  index: Map<string, StatusMeta>,
  statusId: string | null | undefined,
): string {
  if (!statusId) return '—';
  const meta = index.get(statusId);
  if (!meta) return '—';
  return t(`orders.status.${meta.name}`, { defaultValue: meta.name });
}

/**
 * The single status an order may advance to, mirroring the backend
 * (`OrderStatusService.getNextStatus`): the lowest-sequence *active* status
 * after the current one, excluding cancel statuses (cancellation is a separate
 * action). Returns `undefined` for terminal orders (delivered / cancelled) —
 * which also means the order can no longer be cancelled.
 */
export function nextStatus(
  list: OrderStatusRecord[],
  currentStatusId: string | null | undefined,
): OrderStatusRecord | undefined {
  const current = list.find((s) => s.id === currentStatusId);
  if (!current || current.is_cancel_status) return undefined;
  return list
    .filter(
      (s) => s.isactive && !s.is_cancel_status && s.sequence > current.sequence,
    )
    .sort((a, b) => a.sequence - b.sequence)[0];
}

/**
 * Verb for the "advance to next status" button. Status names are admin-defined,
 * so map the known lifecycle names to nicer verbs and fall back to a generic
 * "Mark as {name}" for anything custom.
 */
export function advanceActionLabel(t: TFunction, targetName: string): string {
  const key = `orders.actions.${targetName}`;
  return t(key, {
    defaultValue: t('orders.actions.markAs', {
      status: t(`orders.status.${targetName}`, { defaultValue: targetName }),
    }),
  });
}

/** Resolve a `status_id` to its badge colour via the index. */
export function statusColor(
  index: Map<string, StatusMeta>,
  statusId: string | null | undefined,
): string {
  return (statusId ? index.get(statusId)?.color : undefined) ?? colors.textMuted;
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
