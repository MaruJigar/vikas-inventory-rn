import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ordersApi, orderStatusApi } from '@/features/orders/api';
import { indexStatuses } from '@/features/orders/constants';
import type { CreateOrderPayload, UpdateOrderPayload } from '@/types/order';

const PAGE_SIZE = 20;

export const orderKeys = {
  all: ['orders'] as const,
  statuses: ['order-statuses'] as const,
  list: (search: string, statusId: string | null) =>
    ['orders', 'list', search, statusId ?? 'ALL'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  history: (id: string) => ['orders', 'history', id] as const,
};

/** The dynamic status catalogue (GET /order-status) — cached, rarely changes. */
export function useOrderStatuses() {
  return useQuery({
    queryKey: orderKeys.statuses,
    queryFn: () => orderStatusApi.list(),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Convenience over `useOrderStatuses`: an id → meta index (for badges/labels)
 * plus the active statuses sorted by sequence (for filter chips).
 */
export function useStatusIndex() {
  const { data, isLoading } = useOrderStatuses();
  const index = useMemo(() => indexStatuses(data ?? []), [data]);
  const activeStatuses = useMemo(
    () =>
      (data ?? [])
        .filter((s) => s.isactive)
        .sort((a, b) => a.sequence - b.sequence),
    [data],
  );
  return { index, activeStatuses, all: data ?? [], isLoading };
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Invalidate everything a status change can affect: this order's detail +
 * timeline, every orders list, and the distributor dashboard counts. */
function invalidateAfterOrderChange(qc: QueryClient, id: string) {
  void qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
  void qc.invalidateQueries({ queryKey: orderKeys.history(id) });
  void qc.invalidateQueries({ queryKey: orderKeys.all });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

/** Distributor advances an order to the next lifecycle status. */
export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status_id: string; notes?: string }) =>
      ordersApi.updateStatus(id, body),
    onSuccess: () => invalidateAfterOrderChange(qc, id),
  });
}

/** Salesman edits the items of a pre-dispatch order. */
export function useEditOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => ordersApi.update(id, payload),
    onSuccess: () => invalidateAfterOrderChange(qc, id),
  });
}

/** Salesman (own) or distributor cancels an order with a reason. */
export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { cancellationReason: string }) =>
      ordersApi.cancel(id, body),
    onSuccess: () => invalidateAfterOrderChange(qc, id),
  });
}

export function useOrders(search: string, statusId: string | null) {
  return useInfiniteQuery({
    queryKey: orderKeys.list(search, statusId),
    queryFn: ({ pageParam }) =>
      ordersApi.list({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusId ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

/** A small list of the most recent orders — for the dashboard. */
export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ['orders', 'recent', limit],
    queryFn: () => ordersApi.list({ limit }),
    select: (res) => res.data,
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
