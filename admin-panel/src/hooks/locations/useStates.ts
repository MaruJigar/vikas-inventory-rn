import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';

export interface State {
  id: string;
  name: string;
}

export const useStates = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['states'],
    queryFn: () => api.get('/states').then((res) => {
      const data = res.data;
      console.log("response of states =", res.data)
      if (data && Array.isArray((data as Record<string, unknown>).data)) {
        return (data as Record<string, unknown>).data as State[];
      }
      return data as State[];
    }),
    enabled: options?.enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
