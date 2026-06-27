import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  CreateOrderPayload,
  Order,
  OrderStatus,
  OrderStatusHistoryEntry,
} from '@/types/order';

export interface OrderListQuery extends ListQuery {
  status?: OrderStatus;
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
};
