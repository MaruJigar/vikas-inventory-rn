import { api } from '@/lib/api/axios';
import {
  OrderStatusDto,
  CreateOrderStatusDto,
  UpdateOrderStatusDto,
} from '@/types/api/order-status.types';

export * from '@/types/api/order-status.types';

export const orderStatusService = {
  getAll: async (): Promise<OrderStatusDto[]> => {
    const res = await api.get<OrderStatusDto[]>('/order-status');
    return res.data;
  },

  getActiveStatuses: async (): Promise<{
    id: string;
    name: string;
    sequence: number;
    can_cancel_order: boolean;
    is_cancel_status: boolean;
    is_dispatch_status: boolean;
  }[]> => {
    const res = await api.get('/order-status/active');
    return res.data;
  },

  getById: async (id: string): Promise<OrderStatusDto> => {
    const res = await api.get<OrderStatusDto>(`/order-status/${id}`);
    return res.data;
  },

  create: async (data: CreateOrderStatusDto): Promise<OrderStatusDto> => {
    const res = await api.post<OrderStatusDto>('/order-status', data);
    return res.data;
  },

  update: async (id: string, data: UpdateOrderStatusDto): Promise<OrderStatusDto> => {
    const res = await api.put<OrderStatusDto>(`/order-status/${id}`, data);
    return res.data;
  },

  getNextStatus: async (id: string) => {
    const res = await api.get<{ id: string; name: string; can_cancel_order: boolean }>(`/order-status/${id}/next`);
    return res.data;
  },
};
