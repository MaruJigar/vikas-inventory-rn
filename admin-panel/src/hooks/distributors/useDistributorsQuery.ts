import { useQuery } from '@tanstack/react-query';
import { distributorService } from '@/services/distributor.service';
import { distributorsKeys } from '@/lib/query-keys/distributors';
import { QueryParams } from '@/types/api/common.types';

export function useDistributorsQuery(params: QueryParams = { limit: 100 }) {
  return useQuery({
    queryKey: distributorsKeys.list(params),
    queryFn: () => distributorService.getDistributors(params),
    placeholderData: (previousData) => previousData,
  });
}
