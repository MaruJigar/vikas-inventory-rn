import { apiClient } from '@/api/client';
import type { City, State } from '@/types/region';

export const regionApi = {
  /** All states, sorted by name (backend). */
  states: () => apiClient.get<State[]>('/states').then((r) => r.data),

  /** Cities for a given state (backend filters by state_id). */
  cities: (stateId: string) =>
    apiClient
      .get<City[]>('/cities', { params: { state_id: stateId } })
      .then((r) => r.data),
};
