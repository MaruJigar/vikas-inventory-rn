import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { salesmenApi } from '@/features/salesman/api';
import type {
  CreateSalesmanPayload,
  UpdateSalesmanPayload,
} from '@/types/salesman';

const PAGE_SIZE = 20;

export const salesmanKeys = {
  all: ['salesmen'] as const,
  list: (search: string) => ['salesmen', 'list', search] as const,
  detail: (id: string) => ['salesmen', 'detail', id] as const,
};

export function useSalesmen(search: string) {
  return useInfiniteQuery({
    queryKey: salesmanKeys.list(search),
    queryFn: ({ pageParam }) =>
      salesmenApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useSalesman(id: string) {
  return useQuery({
    queryKey: salesmanKeys.detail(id),
    queryFn: () => salesmenApi.getById(id),
  });
}

export function useCreateSalesman() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesmanPayload) => salesmenApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesmanKeys.all });
    },
  });
}

export function useUpdateSalesman(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSalesmanPayload) =>
      salesmenApi.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: salesmanKeys.all });
      void qc.invalidateQueries({ queryKey: salesmanKeys.detail(id) });
    },
  });
}
