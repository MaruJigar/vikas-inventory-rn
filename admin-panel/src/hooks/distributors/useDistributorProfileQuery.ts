import { useQuery } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';

export function useDistributorProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['distributor-profile'],
    queryFn: () => distributorService.getProfile(),
    enabled,
  });
}
