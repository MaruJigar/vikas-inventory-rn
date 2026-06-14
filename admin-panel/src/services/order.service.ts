import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { OrderDto, CreateOrderDto, UpdateOrderDto, CancelOrderDto } from '@/types/api/order.types';

export const orderService = {
  createOrder: (data: CreateOrderDto) => api.post<ApiResponse<OrderDto>>('/orders', data).then(res => res.data),
  getOrders: (params?: QueryParams) => api.get<PaginatedResponse<OrderDto>>('/orders', { params }).then(res => res.data),
  getOrderById: (id: string) => api.get<ApiResponse<OrderDto>>(`/orders/${id}`).then(res => res.data),
  updateOrder: (id: string, data: UpdateOrderDto) => api.put<ApiResponse<OrderDto>>(`/orders/${id}`, data).then(res => res.data),
  cancelOrder: (id: string, data: CancelOrderDto) => api.put<ApiResponse<OrderDto>>(`/orders/${id}/cancel`, data).then(res => res.data),
};
