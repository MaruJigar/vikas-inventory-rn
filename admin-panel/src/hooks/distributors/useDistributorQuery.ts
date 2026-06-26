import { useQuery } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';

export function useDistributorQuery(id?: string) {
  return useQuery({
    queryKey: distributorsKeys.detail(id!),
    queryFn: () => distributorService.getDistributorById(id!),
    enabled: !!id,
  });
}
