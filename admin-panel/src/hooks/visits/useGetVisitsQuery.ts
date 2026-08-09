import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import { VisitsResponse } from '@/types/api/visit.types';

export interface UseGetVisitsQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
  status?: string;
}

export function useGetVisitsQuery(options: UseGetVisitsQueryOptions = {}) {
  const queryParams = new URLSearchParams();

  if (options.page) queryParams.append('page', options.page.toString());
  if (options.limit) queryParams.append('limit', options.limit.toString());
  if (options.search) queryParams.append('search', options.search);
  if (options.sortBy) queryParams.append('sortBy', options.sortBy);
  if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);
  if (options.startDate) queryParams.append('startDate', options.startDate);
  if (options.endDate) queryParams.append('endDate', options.endDate);
  if (options.status) queryParams.append('status', options.status);

  return useQuery({
    queryKey: ['visits', options],
    queryFn: async () => {
      const { data } = await api.get<VisitsResponse>(`/visits?${queryParams.toString()}`);
      return data;
    },
  });
}
