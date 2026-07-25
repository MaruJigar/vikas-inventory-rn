import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { backordersApi } from '@/features/backorders/api';
import type {
  BackorderStatus,
  ResolveBackorderPayload,
} from '@/features/backorders/types';

const PAGE_SIZE = 20;

export const backorderKeys = {
  all: ['backorders'] as const,
  list: (status: BackorderStatus | null) =>
    ['backorders', 'list', status ?? 'ALL'] as const,
  detail: (id: string) => ['backorders', 'detail', id] as const,
};

/** Distributor's backorders, newest first. The backend list applies no text
 * search, so we filter by status only. */
export function useBackorders(status: BackorderStatus | null) {
  return useInfiniteQuery({
    queryKey: backorderKeys.list(status),
    queryFn: ({ pageParam }) =>
      backordersApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        status: status ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useBackorder(id: string) {
  return useQuery({
    queryKey: backorderKeys.detail(id),
    queryFn: () => backordersApi.getById(id),
  });
}

/** Distributor resolves (allocates) on-hand stock against a backorder. This also
 * moves inventory and can free the parent order for dispatch, so invalidate
 * orders + dashboard alongside the backorder caches. */
export function useResolveBackorder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResolveBackorderPayload) =>
      backordersApi.resolve(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backorderKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: backorderKeys.all });
      void qc.invalidateQueries({ queryKey: ['orders'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
