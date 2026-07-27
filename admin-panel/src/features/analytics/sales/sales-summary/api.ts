import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { AnalyticsQueryParams } from '@/types/api/analytics.types';
import { SalesReportItem } from './types';

export const salesSummaryApi = {
  getSalesSummary: (params?: AnalyticsQueryParams) =>
    api.get<unknown>('/analytics/sales/reports/sales-summary', { params }).then((res) => ({
      success: true,
      data: res.data,
    }) as ApiResponse<SalesReportItem[]>),
};
