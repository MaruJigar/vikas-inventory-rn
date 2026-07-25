import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/features/dashboard/api';
import { ordersApi } from '@/features/orders/api';
import { useOrderStatuses } from '@/features/orders/hooks';

export const dashboardKeys = {
  analytics: ['dashboard', 'analytics'] as const,
  purchaseOrders: ['dashboard', 'purchaseOrders'] as const,
};

/**
 * Count of the distributor's purchase orders (distributor→manufacturer, i.e.
 * `salesman_id` is null). The backend exposes no order-type filter, so we fetch
 * one large page and count client-side — the list caps at 1000 rows, which is
 * ample for the app's scale. `capped` flags the rare overflow.
 */
export function usePurchaseOrderCount() {
  return useQuery({
    queryKey: dashboardKeys.purchaseOrders,
    queryFn: async () => {
      const res = await ordersApi.list({ page: 1, limit: 1000 });
      const count = res.data.filter((o) => !o.salesman_id).length;
      return { count, capped: res.meta.total > res.data.length };
    },
    staleTime: 60_000,
  });
}

/**
 * Summary tiles map to a list of candidate status names (statuses are dynamic).
 * The analytics `statusDistribution.status` is the status NAME (the backend
 * groups by `status.name`), so we count rows by name and sum across every
 * candidate present. `statusId` (for navigating to the filtered Orders list) is
 * resolved from the first candidate that exists in the catalogue.
 */
const TILE_STATUS_NAMES = {
  pending: ['PENDING', 'CREATED', 'NEW'],
  approved: ['ORDERED', 'CONFIRMED', 'APPROVED', 'PROCESSING', 'PACKED', 'ACCEPTED'],
  dispatched: ['SHIPPED', 'DISPATCHED', 'OUT_FOR_DELIVERY'],
} as const;

export interface OrderSummaryTile {
  count: number;
  /** Resolved status_id to pre-filter the Orders list, if one matched. */
  statusId?: string;
}

/** Distributor orders-summary counts derived from the analytics dashboard. */
export function useDistributorOrderSummary() {
  const { data: statuses } = useOrderStatuses();
  const analytics = useQuery({
    queryKey: dashboardKeys.analytics,
    queryFn: () => dashboardApi.analytics(),
  });

  const data = useMemo(() => {
    const rows = analytics.data?.orders?.statusDistribution ?? [];
    const idByName = new Map(
      (statuses ?? []).map((s) => [s.name.toUpperCase(), s.id]),
    );
    // Sum analytics rows (keyed by status NAME) across a tile's candidates, and
    // resolve the first present candidate's id for list navigation.
    const countByName = new Map<string, number>();
    for (const r of rows) {
      const name = (r.status ?? '').toUpperCase();
      countByName.set(name, (countByName.get(name) ?? 0) + r.count);
    }
    const tile = (names: readonly string[]): OrderSummaryTile => {
      let count = 0;
      let statusId: string | undefined;
      for (const n of names) {
        count += countByName.get(n) ?? 0;
        if (!statusId) statusId = idByName.get(n);
      }
      return { count, statusId };
    };
    return {
      pending: tile(TILE_STATUS_NAMES.pending),
      approved: tile(TILE_STATUS_NAMES.approved),
      dispatched: tile(TILE_STATUS_NAMES.dispatched),
    };
  }, [analytics.data, statuses]);

  return { data, isLoading: analytics.isLoading, isError: analytics.isError };
}
