import { useQuery } from '@tanstack/react-query';
import { salesmanService } from '@/services/salesman.service';
import { salesmenKeys } from '@/lib/query-keys/salesmen';
import { QueryParams } from '@/types/api/common.types';

export function useSalesmenQuery(params: QueryParams) {
  return useQuery({
    queryKey: salesmenKeys.list(params),
    queryFn: () => salesmanService.getSalesmen(params),
    placeholderData: (previousData) => previousData,
  });
}
