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
  list: (search: string, status: BackorderStatus | null) =>
    ['backorders', 'list', search, status ?? 'ALL'] as const,
  detail: (id: string) => ['backorders', 'detail', id] as const,
};

export function useBackorders(search: string, status: BackorderStatus | null) {
  return useInfiniteQuery({
    queryKey: backorderKeys.list(search, status),
    queryFn: ({ pageParam }) =>
      backordersApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
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

/** Distributor allocates stock against a backorder. */
export function useResolveBackorder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResolveBackorderPayload) =>
      backordersApi.resolve(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backorderKeys.detail(id) });
      void qc.invalidateQueries({ queryKey: backorderKeys.all });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
