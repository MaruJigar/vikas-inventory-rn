import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type { WorkingDay } from '@/features/attendance/types';

export interface AttendanceListQuery extends ListQuery {
  /** Distributors may scope to a single salesman. */
  salesman_id?: string;
}

/** GET /v1/working-day/history — paginated, role-scoped attendance records. */
export const attendanceApi = {
  list: (query: AttendanceListQuery) =>
    apiClient
      .get<Paginated<WorkingDay>>('/working-day/history', { params: query })
      .then((r) => r.data),
};
