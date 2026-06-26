export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  sales: () => [...analyticsKeys.all, 'sales'] as const,
  visits: () => [...analyticsKeys.all, 'visits'] as const,
  orders: (params?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'orders', params ?? {}] as const,
  inventory: () => [...analyticsKeys.all, 'inventory'] as const,
  backorders: () => [...analyticsKeys.all, 'backorders'] as const,
  fulfillment: () => [...analyticsKeys.all, 'fulfillment'] as const,
  approvals: () => [...analyticsKeys.all, 'approvals'] as const,
};

