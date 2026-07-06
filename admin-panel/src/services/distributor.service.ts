import { api } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { DistributorDto, CreateDistributorAdminDto, UpdateDistributorAdminDto } from '@/types/api/distributor.types';

export const distributorService = {
  getDistributors: (params?: QueryParams) => api.get<PaginatedResponse<DistributorDto>>('/distributors', { params }).then(res => res.data),
  getDistributorById: (id: string) => api.get<DistributorDto>(`/distributors/${id}`).then(res => res.data),
  createDistributorAdmin: (data: CreateDistributorAdminDto) => api.post<{ user: unknown; profile: DistributorDto }>('/distributors', data).then(res => res.data),
  updateDistributorAdmin: (id: string, data: UpdateDistributorAdminDto) => api.patch<DistributorDto>(`/distributors/${id}`, data).then(res => res.data),
  deleteDistributorAdmin: (id: string) => api.delete<{ message: string }>(`/distributors/${id}`).then(res => res.data),
};
