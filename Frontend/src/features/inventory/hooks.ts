import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { inventoryApi, type InventorySortBy } from '@/features/inventory/api';
import type {
  AdjustStockPayload,
  UpdateInventorySettingsPayload,
} from '@/types/inventory';

const PAGE_SIZE = 20;

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (sortBy: InventorySortBy, sortOrder: 'ASC' | 'DESC') =>
    ['inventory', 'list', sortBy, sortOrder] as const,
  movements: (id: string, type: string | null) =>
    ['inventory', 'movements', id, type ?? 'ALL'] as const,
  valuation: ['inventory', 'valuation'] as const,
  settings: ['inventory', 'settings'] as const,
};

/**
 * The distributor's stock rows. The backend applies no text search on this
 * endpoint, so the list screen filters the loaded pages client-side — which is
 * why the query key carries only the sort.
 */
export function useInventory(
  sortBy: InventorySortBy = 'updated_at',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
) {
  return useInfiniteQuery({
    queryKey: inventoryKeys.list(sortBy, sortOrder),
    queryFn: ({ pageParam }) =>
      inventoryApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

/** Movement ledger for one inventory row, optionally filtered to one type. */
export function useInventoryMovements(id: string, movementType: string | null) {
  return useInfiniteQuery({
    queryKey: inventoryKeys.movements(id, movementType),
    queryFn: ({ pageParam }) =>
      inventoryApi.movements(id, {
        page: pageParam,
        limit: PAGE_SIZE,
        status: movementType ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

/**
 * Manual stock adjustment. Touches quantities that the catalog, dashboard and
 * order flow all read, so invalidate broadly — and the valuation report, whose
 * totals are derived from these same rows.
 */
export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdjustStockPayload) => inventoryApi.adjust(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
      void qc.invalidateQueries({ queryKey: ['products'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** The org-level low-stock threshold. Rarely changes, so cache it a while. */
export function useInventorySettings() {
  return useQuery({
    queryKey: inventoryKeys.settings,
    queryFn: () => inventoryApi.settings(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Save the low-stock threshold. Every inventory row carries the threshold and
 * its derived `stock_status`, so the whole list is stale once this changes —
 * and so is the dashboard's low-stock count.
 */
export function useUpdateInventorySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateInventorySettingsPayload) =>
      inventoryApi.updateSettings(payload),
    onSuccess: (settings) => {
      qc.setQueryData(inventoryKeys.settings, settings);
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/** Stock valuation report — small, unpaginated, and rarely changes intraday. */
export function useInventoryValuation() {
  return useQuery({
    queryKey: inventoryKeys.valuation,
    queryFn: () => inventoryApi.valuation(),
    staleTime: 5 * 60 * 1000,
  });
}
