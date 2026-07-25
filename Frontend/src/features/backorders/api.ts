import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  Backorder,
  BackorderStatus,
  ResolveBackorderPayload,
} from '@/features/backorders/types';

export interface BackorderListQuery extends ListQuery {
  status?: BackorderStatus;
}

/** Backorders live under the order controller → `/v1/orders/backorders`,
 * role-scoped to the caller's distributor (salesman sees own-order backorders). */
export const backordersApi = {
  list: (query: BackorderListQuery) =>
    apiClient
      .get<Paginated<Backorder>>('/orders/backorders', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Backorder>(`/orders/backorders/${id}`).then((r) => r.data),

  resolve: (id: string, payload: ResolveBackorderPayload) =>
    apiClient
      .patch<Backorder>(`/orders/backorders/${id}/resolve`, payload)
      .then((r) => r.data),
};
