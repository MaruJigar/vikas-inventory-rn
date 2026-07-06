import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { OrderDto, CreateOrderDto, UpdateOrderDto, CancelOrderDto, UpdateOrderStatusDto, OrderRevisionDto, OrderStatusHistoryDto, FulfillmentLogsResponse, BackordersResponse, BackorderDto, BackorderResolutionDto } from '@/types/api/order.types';

export const orderService = {
  createOrder: (data: CreateOrderDto) => api.post<ApiResponse<OrderDto>>('/orders', data).then(res => res.data),
  getOrders: (params?: QueryParams) => api.get<PaginatedResponse<OrderDto>>('/orders', { params }).then(res => res.data),
  getOrderById: (id: string) => api.get<ApiResponse<OrderDto>>(`/orders/${id}`).then(res => res.data),
  updateOrder: (id: string, data: UpdateOrderDto) => api.patch<ApiResponse<OrderDto>>(`/orders/${id}`, data).then(res => res.data),
  cancelOrder: (id: string, data: CancelOrderDto) => api.patch<ApiResponse<OrderDto>>(`/orders/${id}/cancel`, data).then(res => res.data),
  updateOrderStatus: (id: string, data: UpdateOrderStatusDto) => api.patch<ApiResponse<OrderDto>>(`/orders/${id}/status`, data).then(res => res.data),
  getOrderRevisions: (id: string, params?: QueryParams) => api.get<PaginatedResponse<OrderRevisionDto>>(`/orders/${id}/revisions`, { params }).then(res => res.data),
  getOrderStatusHistory: (id: string, params?: QueryParams) => api.get<PaginatedResponse<OrderStatusHistoryDto>>(`/orders/${id}/status-history`, { params }).then(res => res.data),
  getFulfillmentLogs: (id: string, params?: QueryParams) => api.get<FulfillmentLogsResponse>(`/orders/${id}/fulfillment-logs`, { params }).then(res => res.data),
  
  getBackorders: (params?: QueryParams) => api.get<BackordersResponse>('/orders/backorders', { params }).then(res => res.data),
  getBackorderById: (id: string) => api.get<ApiResponse<BackorderDto>>(`/orders/backorders/${id}`).then(res => res.data),
  resolveBackorder: (id: string, data: BackorderResolutionDto) => api.patch<ApiResponse<BackorderDto>>(`/orders/backorders/${id}/resolve`, data).then(res => res.data),
};
