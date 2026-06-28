/** Subset of `GET /v1/analytics/dashboard` that the app currently consumes. */

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface OrdersAnalytics {
  totals: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: string;
  };
  statusDistribution: OrderStatusCount[];
}

export interface FulfillmentAnalytics {
  ordersPendingDispatch: number;
  ordersDispatched: number;
  ordersDelivered: number;
  partialDeliveries: number;
}

/**
 * Full payload also carries workingDay/visits/inventory/backorders/approvals/
 * notifications — only the slices used so far are typed here.
 */
export interface DashboardAnalytics {
  orders: OrdersAnalytics;
  fulfillment: FulfillmentAnalytics;
}
