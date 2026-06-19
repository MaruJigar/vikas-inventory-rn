import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: analyticsService.getDashboard,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce backend load
  });
};
