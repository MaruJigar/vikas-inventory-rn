import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { analyticsKeys } from '@/lib/query-keys/analytics';
import { AnalyticsQueryParams } from '@/types/api/analytics.types';

export function useOrdersAnalyticsQuery(params: AnalyticsQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.orders(params as Record<string, unknown>),
    queryFn: () => analyticsService.getOrdersAnalytics(params),
  });
}
