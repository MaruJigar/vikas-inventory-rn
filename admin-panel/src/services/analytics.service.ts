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
  getDashboard: () =>
    api.get<any>('/analytics/dashboard').then((res) => {
      const raw = res.data;
      const mapped: DashboardResponse = {
        workingDay: {
          activeCount: raw.workingDay?.checkedInToday ?? 0,
          completedCount: raw.workingDay?.checkedOutToday ?? 0,
          totalDistance: 0,
          totalExpenses: 0,
        },
        visits: {
          plannedCount: raw.visits?.totalVisits ?? 0,
          completedCount: raw.visits?.completedVisits ?? 0,
          productiveCount:
            (raw.visits?.completedVisits ?? 0) - (raw.visits?.noOrderVisits ?? 0),
        },
        orders: {
          totalOrders: raw.orders?.totals?.totalOrders ?? 0,
          totalValue: raw.orders?.totals?.totalRevenue ?? 0,
          pendingCount:
            raw.orders?.statusDistribution?.find((s: any) => s.status === 'PENDING')
              ?.count ?? 0,
          approvedCount:
            raw.orders?.statusDistribution?.find((s: any) => s.status === 'APPROVED')
              ?.count ?? 0,
          rejectedCount:
            raw.orders?.statusDistribution?.find((s: any) => s.status === 'REJECTED')
              ?.count ?? 0,
        },
        fulfillment: {
          pendingDeliveryCount: raw.fulfillment?.ordersPendingDispatch ?? 0,
          deliveredCount: raw.fulfillment?.ordersDelivered ?? 0,
          partiallyDeliveredCount: raw.fulfillment?.partialDeliveries ?? 0,
        },
        inventory: {
          lowStockItemsCount: raw.inventory?.lowStockProducts ?? 0,
          outOfStockItemsCount: 0,
          totalStockValue: 0,
        },
        backorders: {
          totalBackorders: raw.backorders?.openBackorders ?? 0,
          allocatedCount: raw.backorders?.resolvedBackorders ?? 0,
          pendingAllocationCount: raw.backorders?.openBackorders ?? 0,
        },
        approvals: {
          pendingRequestsCount: raw.approvals?.pendingApprovals ?? 0,
          approvedRequestsCount: raw.approvals?.approvedToday ?? 0,
          rejectedRequestsCount: raw.approvals?.rejectedToday ?? 0,
        },
        notifications: {
          unreadCount: raw.notifications?.unreadNotifications ?? 0,
        },
      };
      return {
        success: true,
        data: mapped,
      } as ApiResponse<DashboardResponse>;
    }),

  getSales: () => api.get<ApiResponse<DashboardResponse>>('/analytics/sales').then(res => res.data),
  getVisits: () => api.get<ApiResponse<VisitResponse>>('/analytics/visits').then(res => res.data),
  getOrders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/orders').then(res => res.data),

  getOrdersAnalytics: (params?: AnalyticsQueryParams) =>
    api.get<any>('/analytics/orders', { params }).then((res) => ({
      success: true,
      data: res.data,
    }) as ApiResponse<OrdersAnalyticsDto>),

  getInventory: () => api.get<ApiResponse<InventoryResponse>>('/analytics/inventory').then(res => res.data),
  getBackorders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/backorders').then(res => res.data),
  getFulfillment: () => api.get<ApiResponse<FulfillmentResponse>>('/analytics/fulfillment').then(res => res.data),
  getApprovals: () => api.get<ApiResponse<ApprovalsResponse>>('/analytics/approvals').then(res => res.data),
};

