import { useQuery } from '@tanstack/react-query';

import { regionApi } from '@/features/region/api';

/** States/cities change rarely — cache them for the session. */
const HOUR = 1000 * 60 * 60;

export const regionKeys = {
  states: ['regions', 'states'] as const,
  cities: (stateId: string) => ['regions', 'cities', stateId] as const,
};

export function useStates() {
  return useQuery({
    queryKey: regionKeys.states,
    queryFn: regionApi.states,
    staleTime: HOUR,
  });
}

/** Cities for the selected state; disabled until a state is chosen. */
export function useCities(stateId: string | undefined) {
  return useQuery({
    queryKey: regionKeys.cities(stateId ?? ''),
    queryFn: () => regionApi.cities(stateId as string),
    enabled: !!stateId,
    staleTime: HOUR,
  });
}
