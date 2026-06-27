import { apiClient } from '@/api/client';
import type { Paginated } from '@/api/types';
import type {
  CheckInPayload,
  EndVisitPayload,
  NoOrderVisitPayload,
  ShopVisit,
  StartVisitPayload,
  WorkingDay,
} from '@/types/visit';

export const visitApi = {
  checkIn: (payload: CheckInPayload) =>
    apiClient
      .post<WorkingDay>('/working-day/check-in', payload)
      .then((r) => r.data),

  /** Working-day history (plain array, newest first). */
  history: () =>
    apiClient.get<WorkingDay[]>('/working-day/history').then((r) => r.data),

  /** The salesman's current ACTIVE visit, if any. */
  activeVisit: () =>
    apiClient
      .get<Paginated<ShopVisit>>('/visits', {
        params: { status: 'ACTIVE', limit: 1 },
      })
      .then((r) => r.data.data[0] ?? null),

  checkOut: (payload: CheckInPayload) =>
    apiClient
      .post<WorkingDay>('/working-day/check-out', payload)
      .then((r) => r.data),

  startVisit: (payload: StartVisitPayload) =>
    apiClient.post<ShopVisit>('/visits/start', payload).then((r) => r.data),

  endVisit: (payload: EndVisitPayload) =>
    apiClient.post<ShopVisit>('/visits/end', payload).then((r) => r.data),

  noOrderVisit: (payload: NoOrderVisitPayload) =>
    apiClient.post<ShopVisit>('/visits/no-order', payload).then((r) => r.data),
};
