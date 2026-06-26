import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import {
  DashboardResponse,
  OrdersResponse,
  InventoryResponse,
  VisitResponse,
  FulfillmentResponse,
  ApprovalsResponse,
  AnalyticsQueryParams,
  OrdersAnalyticsDto,
} from '@/types/api/analytics.types';

export const analyticsService = {
  getDashboard: () => api.get<ApiResponse<DashboardResponse>>('/analytics/dashboard').then(res => res.data),
  getSales: () => api.get<ApiResponse<DashboardResponse>>('/analytics/sales').then(res => res.data),
  getVisits: () => api.get<ApiResponse<VisitResponse>>('/analytics/visits').then(res => res.data),
  getOrders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/orders').then(res => res.data),
  getOrdersAnalytics: (params?: AnalyticsQueryParams) =>
    api.get<ApiResponse<OrdersAnalyticsDto>>('/analytics/orders', { params }).then(res => res.data),
  getInventory: () => api.get<ApiResponse<InventoryResponse>>('/analytics/inventory').then(res => res.data),
  getBackorders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/backorders').then(res => res.data),
  getFulfillment: () => api.get<ApiResponse<FulfillmentResponse>>('/analytics/fulfillment').then(res => res.data),
  getApprovals: () => api.get<ApiResponse<ApprovalsResponse>>('/analytics/approvals').then(res => res.data),
};

