import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { WorkingDayDto, CheckInDto, CheckOutDto } from '@/types/api/working-day.types';

export const workingDayService = {
  checkIn: (data: CheckInDto) => api.post<ApiResponse<WorkingDayDto>>('/working-day/check-in', data).then(res => res.data),
  checkOut: (data: CheckOutDto) => api.post<ApiResponse<WorkingDayDto>>('/working-day/check-out', data).then(res => res.data),
  getHistory: (params?: QueryParams) => api.get<PaginatedResponse<WorkingDayDto>>('/working-day/history', { params }).then(res => res.data),
};
