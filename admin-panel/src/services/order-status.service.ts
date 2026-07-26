import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';

export interface OrderStatusDto {
  id: string;
  name: string;
  sequence: number;
  is_active: boolean;
  is_initial: boolean;
  is_final: boolean;
  can_cancel_order: boolean;
  created_at: string;
  updated_at: string;
}

export const orderStatusService = {
  getNextStatus: (id: string) => api.get<ApiResponse<OrderStatusDto>>(`/order-status/${id}/next`).then(res => res.data),
};
