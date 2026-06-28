import { useQuery } from '@tanstack/react-query';

import { distributorApi } from '@/features/distributor/api';

/**
 * The signed-in distributor's profile. Needed wherever the distributor's own
 * id is required (e.g. creating a salesman). Only fetch when enabled (i.e. the
 * user is actually a distributor).
 */
export function useDistributorProfile(enabled = true) {
  return useQuery({
    queryKey: ['distributor', 'profile'],
    queryFn: () => distributorApi.profile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
