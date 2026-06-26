import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api/common.types';
import { ManufacturerDto, CreateManufacturerDto, UpdateManufacturerDto, CreateManufacturerAdminDto } from '@/types/api/manufacturer.types';

export const manufacturerService = {
  createManufacturerAdmin: (data: CreateManufacturerAdminDto) => api.post<{ user: unknown; profile: ManufacturerDto }>('/manufacturers', data).then(res => res.data),
  updateManufacturerAdmin: (id: string, data: UpdateManufacturerDto & { is_active?: boolean }) => api.patch<ApiResponse<ManufacturerDto>>(`/manufacturers/${id}`, data).then(res => res.data),
  deleteManufacturerAdmin: (id: string) => api.delete<{ message: string }>(`/manufacturers/${id}`).then(res => res.data),
  createProfile: (data: CreateManufacturerDto) => api.post<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
  getProfile: () => api.get<ApiResponse<ManufacturerDto>>('/manufacturers/profile').then(res => res.data),
  updateProfile: (data: UpdateManufacturerDto) => api.put<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
  getManufacturers: (params?: Record<string, unknown>) => api.get<PaginatedResponse<ManufacturerDto>>('/manufacturers', { params }).then(res => res.data),
  getManufacturerById: (id: string) => api.get<ApiResponse<ManufacturerDto>>(`/manufacturers/${id}`).then(res => res.data),
};
