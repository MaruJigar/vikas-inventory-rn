import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { SalesmanDto, RegisterSalesmanDto, UpdateSalesmanDto } from '@/types/api/salesman.types';

export const salesmanService = {
  register: (data: RegisterSalesmanDto) => api.post<ApiResponse<SalesmanDto>>('/salesmen/register', data).then(res => res.data),
  getSalesmen: (params?: QueryParams) => api.get<PaginatedResponse<SalesmanDto>>('/salesmen', { params }).then(res => res.data),
  getSalesmanById: (id: string) => api.get<ApiResponse<SalesmanDto>>(`/salesmen/${id}`).then(res => res.data),
  updateSalesman: (id: string, data: UpdateSalesmanDto) => api.put<ApiResponse<SalesmanDto>>(`/salesmen/${id}`, data).then(res => res.data),
};
