import { apiClient } from '@/api/client';
import type {
  Distributor,
  UpdateDistributorProfilePayload,
} from '@/types/distributor';

export const distributorApi = {
  /** The signed-in distributor's own profile (GET /v1/distributors/profile). */
  profile: () =>
    apiClient.get<Distributor>('/distributors/profile').then((r) => r.data),

  /** Update the signed-in distributor's profile (PUT /v1/distributors/profile). */
  updateProfile: (payload: UpdateDistributorProfilePayload) =>
    apiClient
      .put<Distributor>('/distributors/profile', payload)
      .then((r) => r.data),
};
