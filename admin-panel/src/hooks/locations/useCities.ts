import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';

export interface City {
  id: string;
  name: string;
  state_id: string;
}

export const useCities = (stateId?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['cities', stateId],
    queryFn: () =>
      api
        .get('/cities', { params: { state_id: stateId } })
        .then((res) => {
          const data = res.data;
          if (data && Array.isArray((data as any).data)) {
            return (data as any).data as City[];
          }
          return data as City[];
        }),
    enabled: !!stateId && (options?.enabled !== false), // Fetch if state is selected and explicitly not disabled
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
