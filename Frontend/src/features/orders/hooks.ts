import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { ordersApi } from '@/features/orders/api';
import type { CreateOrderPayload, OrderStatus } from '@/types/order';

const PAGE_SIZE = 20;

export const orderKeys = {
  all: ['orders'] as const,
  list: (search: string, status: OrderStatus | null) =>
    ['orders', 'list', search, status ?? 'ALL'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  history: (id: string) => ['orders', 'history', id] as const,
};

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useOrders(search: string, status: OrderStatus | null) {
  return useInfiniteQuery({
    queryKey: orderKeys.list(search, status),
    queryFn: ({ pageParam }) =>
      ordersApi.list({
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

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
  });
}

export function useOrderStatusHistory(id: string) {
  return useQuery({
    queryKey: orderKeys.history(id),
    queryFn: () => ordersApi.statusHistory(id),
    select: (res) => res.data,
  });
}
