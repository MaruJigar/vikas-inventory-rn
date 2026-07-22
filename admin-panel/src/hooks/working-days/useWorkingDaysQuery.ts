import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { PaginatedResponse } from '@/types/api/common.types';
import { WorkingDayDto, WorkingDayQueryDto } from '@/types/api/working-day.types';

export function useWorkingDaysQuery(params: WorkingDayQueryDto) {
  return useQuery({
    queryKey: ['working-days', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WorkingDayDto>>('/working-day/history', { params });
      return data;
    },
  });
}
