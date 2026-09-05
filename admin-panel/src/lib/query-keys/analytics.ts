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
  attendance: {
    all: () => [...analyticsKeys.all, 'attendance'] as const,
    summary: (params?: Record<string, unknown>) => [...analyticsKeys.all, 'attendance', 'summary', params ?? {}] as const,
    daily: (params?: Record<string, unknown>) => [...analyticsKeys.all, 'attendance', 'daily', params ?? {}] as const,
    monthly: (params?: Record<string, unknown>) => [...analyticsKeys.all, 'attendance', 'monthly', params ?? {}] as const,
    salesmanDetail: (salesmanId: string, params?: Record<string, unknown>) => [...analyticsKeys.all, 'attendance', 'salesman', salesmanId, params ?? {}] as const,
    timeline: (salesmanId: string, date: string) => [...analyticsKeys.all, 'attendance', 'timeline', salesmanId, date] as const,
  }
};

