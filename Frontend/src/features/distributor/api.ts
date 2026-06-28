import { apiClient } from '@/api/client';
import type { Distributor } from '@/types/distributor';

export const distributorApi = {
  /** The signed-in distributor's own profile (GET /v1/distributors/profile). */
  profile: () =>
    apiClient.get<Distributor>('/distributors/profile').then((r) => r.data),
};
