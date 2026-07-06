import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { FulfillOrderDto, PartialDispatchDto, PartialDeliverDto } from '@/types/api/fulfillment.types';

export const fulfillmentService = {
  confirmOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/confirm`, dto).then(res => res.data),
  processingOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/processing`, dto).then(res => res.data),
  packedOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/packed`, dto).then(res => res.data),
  dispatchOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/dispatch`, dto).then(res => res.data),
  deliverOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/deliver`, dto).then(res => res.data),
  partialDispatchOrder: (id: string, dto: PartialDispatchDto) => api.patch<ApiResponse<void>>(`/orders/${id}/partial-dispatch`, dto).then(res => res.data),
  partialDeliverOrder: (id: string, dto: PartialDeliverDto) => api.patch<ApiResponse<void>>(`/orders/${id}/partial-deliver`, dto).then(res => res.data),
};
