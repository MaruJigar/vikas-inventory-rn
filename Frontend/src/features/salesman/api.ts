import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  CreateSalesmanPayload,
  Salesman,
  UpdateSalesmanPayload,
  UpdateSalesmanStatusPayload,
} from '@/types/salesman';

export const salesmenApi = {
  list: (query: ListQuery) =>
    apiClient
      .get<Paginated<Salesman>>('/salesmen', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Salesman>(`/salesmen/${id}`).then((r) => r.data),

  create: (payload: CreateSalesmanPayload) =>
    apiClient.post<Salesman>('/salesmen', payload).then((r) => r.data),

  update: (id: string, payload: UpdateSalesmanPayload) =>
    apiClient.put<Salesman>(`/salesmen/${id}`, payload).then((r) => r.data),

  updateStatus: (id: string, payload: UpdateSalesmanStatusPayload) =>
    apiClient
      .patch<{ message: string }>(`/salesmen/${id}/status`, payload)
      .then((r) => r.data),
};
