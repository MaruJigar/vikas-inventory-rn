import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  CreateOrderPayload,
  FulfillmentLog,
  Order,
  OrderRevision,
  OrderStatusHistoryEntry,
  OrderStatusRecord,
  UpdateOrderPayload,
} from '@/types/order';

export interface OrderListQuery extends ListQuery {
  /** Now a status_id (uuid), matching the dynamic order_statuses table. */
  status?: string;
  /** Optional scoping filters (backend OrderListQueryDto). */
  salesman_id?: string;
  shop_id?: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post<Order>('/orders', payload).then((r) => r.data),

  /** PATCH /v1/orders/:id — salesman edits a pre-dispatch order. */
  update: (id: string, payload: UpdateOrderPayload) =>
    apiClient.patch<Order>(`/orders/${id}`, payload).then((r) => r.data),

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

  /** GET /v1/orders/:id/revisions — edit history (ascending by revision #). */
  revisions: (id: string) =>
    apiClient
      .get<Paginated<OrderRevision>>(`/orders/${id}/revisions`, {
        params: { limit: 50 },
      })
      .then((r) => r.data),

  /** GET /v1/orders/:id/fulfillment-logs — reserve/allocate/dispatch trail. */
  fulfillmentLogs: (id: string) =>
    apiClient
      .get<Paginated<FulfillmentLog>>(`/orders/${id}/fulfillment-logs`, {
        params: { limit: 50 },
      })
      .then((r) => r.data),

  /** PATCH /v1/orders/:id/status — distributor drives the lifecycle forward.
   * Backend only accepts the single next status by sequence (`status_id`). */
  updateStatus: (id: string, body: { status_id: string; notes?: string }) =>
    apiClient.patch<Order>(`/orders/${id}/status`, body).then((r) => r.data),

  /** PATCH /v1/orders/:id/cancel — salesman (own) or distributor cancels. */
  cancel: (id: string, body: { cancellationReason: string }) =>
    apiClient.patch<Order>(`/orders/${id}/cancel`, body).then((r) => r.data),

  /** GET /v1/orders/:id/invoice/pdf — signed URL for the invoice PDF. */
  getInvoicePdf: (id: string) =>
    apiClient
      .get<{ data: { downloadUrl: string; fileName: string } }>(
        `/orders/${id}/invoice/pdf`,
      )
      .then((r) => r.data.data),
};

/**
 * GET /v1/order-status/active — the dynamic status catalogue (plain array,
 * already sorted by sequence ASC).
 *
 * NOT `/order-status`: that one is `@Roles('SUPER_ADMIN','MANUFACTURER_ADMIN')`
 * and 403s for the distributors and salesmen who use this app. The `/active`
 * route carries no `@Roles`, so any authenticated user may read it. It returns
 * only `isactive = true` rows and omits the flag itself.
 */
export const orderStatusApi = {
  list: () =>
    apiClient
      .get<OrderStatusRecord[]>('/order-status/active')
      .then((r) => r.data),
};
