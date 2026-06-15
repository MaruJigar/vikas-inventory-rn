import { api } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { BackorderDto } from '@/types/api/backorder.types';

export const backorderService = {
  getBackorders: (params?: QueryParams) => api.get<PaginatedResponse<BackorderDto>>('/backorders', { params }).then(res => res.data),
};
