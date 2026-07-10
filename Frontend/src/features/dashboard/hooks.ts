import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/features/dashboard/api';
import { useOrderStatuses } from '@/features/orders/hooks';

export const dashboardKeys = {
  analytics: ['dashboard', 'analytics'] as const,
};

/**
 * Legacy summary tiles predate the dynamic `order_statuses` table, so each maps
 * to a list of candidate status names — the first one that exists in the live
 * catalogue wins. Analytics `statusDistribution.status` is now a status_id, so
 * we resolve the name → id and match on that. A tile with no matching status
 * shows 0 and navigates unfiltered.
 */
const TILE_STATUS_NAMES = {
  pending: ['PENDING', 'CREATED', 'ORDERED'],
  approved: ['CONFIRMED', 'APPROVED', 'PROCESSING', 'PACKED'],
  dispatched: ['SHIPPED', 'DISPATCHED'],
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
    const resolveId = (names: readonly string[]): string | undefined => {
      for (const n of names) {
        const id = idByName.get(n);
        if (id) return id;
      }
      return undefined;
    };
    const tile = (names: readonly string[]): OrderSummaryTile => {
      const statusId = resolveId(names);
      const count = statusId
        ? rows
            .filter((r) => r.status === statusId)
            .reduce((acc, r) => acc + r.count, 0)
        : 0;
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
