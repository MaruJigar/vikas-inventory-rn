import { apiClient } from '@/api/client';
import type { DashboardAnalytics } from '@/features/dashboard/types';

export const dashboardApi = {
  /** Role-scoped on the backend via the bearer token. */
  analytics: () =>
    apiClient
      .get<DashboardAnalytics>('/analytics/dashboard')
      .then((r) => r.data),
};
