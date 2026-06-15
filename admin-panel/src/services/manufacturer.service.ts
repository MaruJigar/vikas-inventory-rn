import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { ManufacturerDto, CreateManufacturerDto, UpdateManufacturerDto } from '@/types/api/manufacturer.types';

export const manufacturerService = {
  createProfile: (data: CreateManufacturerDto) => api.post<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
  getProfile: () => api.get<ApiResponse<ManufacturerDto>>('/manufacturers/profile').then(res => res.data),
  updateProfile: (data: UpdateManufacturerDto) => api.put<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
};
