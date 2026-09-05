import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { InventoryReportItem } from './types';

export const inventoryValuationApi = {
  getInventoryValuation: () =>
    api.get<unknown>('/analytics/inventory/reports/inventory-valuation').then((res) => ({
      success: true,
      data: res.data,
    }) as ApiResponse<InventoryReportItem[]>),
};
