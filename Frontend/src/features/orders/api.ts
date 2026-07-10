import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  CreateOrderPayload,
  Order,
  OrderStatusHistoryEntry,
  OrderStatusRecord,
} from '@/types/order';

export interface OrderListQuery extends ListQuery {
  /** Now a status_id (uuid), matching the dynamic order_statuses table. */
  status?: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>('/orders', payload).then((r) => r.data),

  list: (query: OrderListQuery) =>
    apiClient
      .get<Paginated<Order>>('/orders', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  statusHistory: (id: string) =>
    apiClient
      .get<Paginated<OrderStatusHistoryEntry>>(`/orders/${id}/status-history`, {
        params: { limit: 50, sortOrder: 'ASC' },
      })
      .then((r) => r.data),

  /** PATCH /v1/orders/:id/status — distributor drives the lifecycle forward.
   * Backend only accepts the single next status by sequence (`status_id`). */
  updateStatus: (id: string, body: { status_id: string; notes?: string }) =>
    apiClient.patch<Order>(`/orders/${id}/status`, body).then((r) => r.data),

  /** PATCH /v1/orders/:id/cancel — salesman (own) or distributor cancels. */
  cancel: (id: string, body: { cancellationReason: string }) =>
    apiClient.patch<Order>(`/orders/${id}/cancel`, body).then((r) => r.data),
};

/** GET /v1/order-status — the dynamic status catalogue (plain array, sorted). */
export const orderStatusApi = {
  list: () =>
    apiClient.get<OrderStatusRecord[]>('/order-status').then((r) => r.data),
};
