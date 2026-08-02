import { apiClient } from '@/api/client';
import type { Paginated } from '@/api/types';
import type { Manufacturer } from '@/types/product';

/** GET /v1/manufacturers — distributor-accessible; used to resolve a PO's
 * `manufacturer_id` to a display name (orders don't join the manufacturer). */
export const manufacturersApi = {
  list: () =>
    apiClient
      .get<Paginated<Manufacturer>>('/manufacturers', {
        params: { page: 1, limit: 1000 },
      })
      .then((r) => r.data),

  /**
   * GET /v1/manufacturers/lookup — public (`@Public()`), for the signup form.
   * Returns a PLAIN ARRAY of `{id, company_name}` for active manufacturers
   * sorted by name — not the `{data, meta}` envelope the guarded list uses.
   */
  lookup: () =>
    apiClient
      .get<Manufacturer[]>('/manufacturers/lookup')
      .then((r) => r.data),
};
