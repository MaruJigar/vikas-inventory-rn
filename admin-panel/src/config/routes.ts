export const ROUTES = {
  DASHBOARD: '/dashboard',
  APPROVALS: '/approvals',
  MANUFACTURERS: '/manufacturers',
  DISTRIBUTORS: '/distributors',
  SALESMEN: '/salesmen',
  PRODUCTS: '/products',
  SHOPS: '/shops',
  VISITS: '/visits',
  WORKING_DAYS: '/working-days',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  BACKORDERS: '/backorders',
  FULFILLMENT: '/fulfillment',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = typeof ROUTES[RouteKey];
