import type { TFunction } from 'i18next';

import { colors } from '@/theme';
import type { Order, OrderStatusRecord } from '@/types/order';

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
  // The terminal/success status is the highest-sequence non-cancel one. The
  // catalogue is already active-only (see OrderStatusRecord).
  const finalSeq = list
    .filter((s) => !s.is_cancel_status)
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
 * Admin-defined status names arrive as backend constants (`DRAFT`,
 * `OUT_FOR_DELIVERY`). With no translation for one, render it as words instead
 * of shouting caps. A name an admin already cased deliberately ("On hold") is
 * left alone.
 */
function humanizeStatus(name: string): string {
  if (name !== name.toUpperCase()) return name;
  return name
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Translate an admin-defined status name, falling back to a humanized form.
 * The single place status names become display text.
 */
export function statusNameLabel(t: TFunction, name: string): string {
  return t(`orders.status.${name}`, { defaultValue: humanizeStatus(name) });
}

/**
 * Resolve a `status_id` to a display label via the index. Status names are
 * admin-defined, so translate known ones and fall back to a humanized name; if
 * the id isn't in the catalogue yet, render an em-dash rather than a raw uuid.
 */
export function statusLabel(
  t: TFunction,
  index: Map<string, StatusMeta>,
  statusId: string | null | undefined,
): string {
  if (!statusId) return '—';
  const meta = index.get(statusId);
  if (!meta) return '—';
  return statusNameLabel(t, meta.name);
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
    .filter((s) => !s.is_cancel_status && s.sequence > current.sequence)
    .sort((a, b) => a.sequence - b.sequence)[0];
}

/**
 * Whether an order at `statusId` is still pre-dispatch — i.e. its sequence is
 * below the dispatch status (`is_dispatch_status`). Mirrors the backend
 * `OrderStatusService.getPreDispatchStatuses`. Salesman edits are only allowed
 * here. Returns false if there's no status/dispatch status to compare against.
 */
export function isPreDispatch(
  list: OrderStatusRecord[],
  statusId: string | null | undefined,
): boolean {
  const current = list.find((s) => s.id === statusId);
  const dispatch = list.find((s) => s.is_dispatch_status);
  if (!current || !dispatch || current.is_cancel_status) return false;
  return current.sequence < dispatch.sequence;
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
      status: statusNameLabel(t, targetName),
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

/** A percent column is `numeric(5,2)`, so it arrives as e.g. "5.00" — show
 * "5%", but keep a real fraction ("2.5%"). */
export const formatPercent = (value: number | string | null | undefined): string =>
  `${toNum(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%`;

export interface OrderDiscountRow {
  /** i18n key under `orders.detail`. */
  key: string;
  percent: number;
  amount: number;
}

/**
 * The order's discount breakdown, in the sequence the backend applies it
 * (`order.service.ts` `updateOrder`). Each percentage is taken off the balance
 * left by the previous line, so the rows only make sense in this order — a
 * 5% line further down is a smaller amount than a 5% line at the top.
 *
 * Sales orders use standard → special; purchase orders use distributor →
 * margin → freight → special → cash. The other type's fields are 0, and rows
 * with no amount are dropped, so one ordered pass renders either correctly.
 */
export function orderDiscountRows(order: Order): OrderDiscountRow[] {
  const rows: OrderDiscountRow[] = [
    {
      key: 'standardDiscount',
      percent: toNum(order.standard_discount_percent),
      amount: toNum(order.standard_discount_amount),
    },
    {
      key: 'distributorDiscount',
      percent: toNum(order.distributor_discount_percent),
      amount: toNum(order.distributor_discount_amount),
    },
    {
      key: 'distributorMargin',
      percent: toNum(order.distributor_margin_percent),
      amount: toNum(order.distributor_margin_amount),
    },
    {
      key: 'freightDiscount',
      percent: toNum(order.freight_discount_percent),
      amount: toNum(order.freight_discount_amount),
    },
    {
      key: 'specialDiscount',
      percent: toNum(order.special_discount_percent),
      amount: toNum(order.special_discount_amount),
    },
    {
      key: 'cashDiscount',
      percent: toNum(order.cash_discount_percent),
      amount: toNum(order.cash_discount_amount),
    },
  ];
  return rows.filter((r) => r.amount > 0);
}
