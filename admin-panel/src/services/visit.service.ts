import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { VisitDto, StartVisitDto, EndVisitDto, NoOrderVisitDto } from '@/types/api/visit.types';

export const visitService = {
  startVisit: (data: StartVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/start', data).then(res => res.data),
  endVisit: (data: EndVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/end', data).then(res => res.data),
  noOrderVisit: (data: NoOrderVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/no-order', data).then(res => res.data),
  getVisits: (params?: QueryParams) => api.get<PaginatedResponse<VisitDto>>('/visits', { params }).then(res => res.data),
  getVisitById: (id: string) => api.get<ApiResponse<VisitDto>>(`/visits/${id}`).then(res => res.data),
};
