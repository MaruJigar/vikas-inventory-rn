import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  Backorder,
  BackorderStatus,
  AllocateBackorderPayload,
} from '@/features/backorders/types';

export interface BackorderListQuery extends ListQuery {
  status?: BackorderStatus;
}

/** Backend controller is `@Controller('backorders')` → routes live at
 * `/v1/backorders`, role-scoped to the caller's distributor. */
export const backordersApi = {
  list: (query: BackorderListQuery) =>
    apiClient
      .get<Paginated<Backorder>>('/backorders', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Backorder>(`/backorders/${id}`).then((r) => r.data),

  allocate: (id: string, payload: AllocateBackorderPayload) =>
    apiClient
      .post<Backorder>(`/backorders/${id}/allocate`, payload)
      .then((r) => r.data),
};
