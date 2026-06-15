import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { DistributorDto, RegisterDistributorDto, UpdateDistributorDto } from '@/types/api/distributor.types';

export const distributorService = {
  register: (data: RegisterDistributorDto) => api.post<ApiResponse<DistributorDto>>('/distributors/register', data).then(res => res.data),
  getDistributors: (params?: QueryParams) => api.get<PaginatedResponse<DistributorDto>>('/distributors', { params }).then(res => res.data),
  getDistributorById: (id: string) => api.get<ApiResponse<DistributorDto>>(`/distributors/${id}`).then(res => res.data),
  updateDistributor: (id: string, data: UpdateDistributorDto) => api.put<ApiResponse<DistributorDto>>(`/distributors/${id}`, data).then(res => res.data),
};
