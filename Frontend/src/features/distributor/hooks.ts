import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { distributorApi } from '@/features/distributor/api';
import type { UpdateDistributorProfilePayload } from '@/types/distributor';

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

/** Update the distributor's own profile; refreshes the cached profile. */
export function useUpdateDistributorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDistributorProfilePayload) =>
      distributorApi.updateProfile(payload),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ['distributor', 'profile'] }),
  });
}
