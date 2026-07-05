import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/features/dashboard/api';
import type { OrderStatusCount } from '@/features/dashboard/types';

export const dashboardKeys = {
  analytics: ['dashboard', 'analytics'] as const,
};

/** Sum the counts for the given order statuses out of the distribution rows. */
function sumStatuses(rows: OrderStatusCount[] | undefined, statuses: string[]) {
  if (!rows) return 0;
  return rows
    .filter((r) => statuses.includes(r.status))
    .reduce((acc, r) => acc + r.count, 0);
}

/**
 * Status each summary tile maps to. Kept as single statuses so a tile's count
 * matches the Orders list when filtered by that same status (the list filter
 * accepts one status at a time).
 */
export const SUMMARY_TILE_STATUS = {
  pending: 'CREATED',
  approved: 'CONFIRMED',
  dispatched: 'DISPATCHED',
} as const;

/** Distributor orders-summary counts derived from the analytics dashboard. */
export function useDistributorOrderSummary() {
  return useQuery({
    queryKey: dashboardKeys.analytics,
    queryFn: () => dashboardApi.analytics(),
    select: (data) => {
      const rows = data.orders?.statusDistribution;
      return {
        pending: sumStatuses(rows, [SUMMARY_TILE_STATUS.pending]),
        approved: sumStatuses(rows, [SUMMARY_TILE_STATUS.approved]),
        dispatched: sumStatuses(rows, [SUMMARY_TILE_STATUS.dispatched]),
      };
    },
  });
}
