import { useQuery } from '@tanstack/react-query';
import { salesmanService } from '@/services/salesman.service';
import { salesmenKeys } from '@/lib/query-keys/salesmen';

export function useSalesmanQuery(id: string) {
  return useQuery({
    queryKey: salesmenKeys.detail(id),
    queryFn: () => salesmanService.getSalesmanById(id),
    enabled: !!id,
  });
}
