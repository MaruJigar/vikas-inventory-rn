export interface WorkingDayAnalytics {
  activeCount: number;
  completedCount: number;
  totalDistance: number;
  totalExpenses: number;
}

export interface VisitAnalytics {
  plannedCount: number;
  completedCount: number;
  productiveCount: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalValue: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface FulfillmentAnalytics {
  pendingDeliveryCount: number;
  deliveredCount: number;
  partiallyDeliveredCount: number;
}

export interface InventoryAnalytics {
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  totalStockValue: number;
}

export interface ApprovalAnalytics {
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  rejectedRequestsCount: number;
}

export interface BackorderAnalytics {
  totalBackorders: number;
  allocatedCount: number;
  pendingAllocationCount: number;
}

export interface NotificationAnalytics {
  unreadCount: number;
}

export interface DashboardResponse {
  workingDay: WorkingDayAnalytics;
  visits: VisitAnalytics;
  orders: OrderAnalytics;
  fulfillment: FulfillmentAnalytics;
  inventory: InventoryAnalytics;
  backorders: BackorderAnalytics;
  approvals: ApprovalAnalytics;
  notifications: NotificationAnalytics;
}

export interface OrdersResponse {
  total: number;
}
export interface InventoryResponse {
  totalStock: number;
}
export interface VisitResponse {
  totalVisits: number;
}
export interface FulfillmentResponse {
  pendingFulfillment: number;
}
export interface ApprovalsResponse {
  pendingApprovals: number;
}

// ── Module 10: Orders Analytics ──────────────────────────────────────────────

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
}

export interface OrdersAnalyticsTotals {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: string; // toFixed(2) from backend
}

export interface OrdersAnalyticsStatusItem {
  status: string;
  count: number;
}

export interface OrdersAnalyticsTrendItem {
  date: string;       // 'YYYY-MM-DD'
  orderCount: number;
  revenue: number;
}

export interface OrdersAnalyticsLeaderboardItem {
  name: string;       // user.full_name or distributor.business_name — never an ID
  orderCount: number;
  revenue: number;
}

export interface OrdersAnalyticsDto {
  totals: OrdersAnalyticsTotals;
  statusDistribution: OrdersAnalyticsStatusItem[];
  trends: OrdersAnalyticsTrendItem[];
  topSalesmen: OrdersAnalyticsLeaderboardItem[];
  topDistributors: OrdersAnalyticsLeaderboardItem[];
}