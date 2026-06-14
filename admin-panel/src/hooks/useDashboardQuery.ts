import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from '@/lib/query-keys/analytics';
import { analyticsService } from '@/services/analytics.service';

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => analyticsService.getDashboard(),
  });
};
