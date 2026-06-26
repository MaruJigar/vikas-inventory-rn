export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...ordersKeys.lists(), { filters }] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
  revisions: (id: string) => [...ordersKeys.detail(id), 'revisions'] as const,
  statusHistory: (id: string) => [...ordersKeys.detail(id), 'statusHistory'] as const,
  fulfillmentLogs: (id: string) => [...ordersKeys.detail(id), 'fulfillmentLogs'] as const,
  
  backorders: {
    all: () => [...ordersKeys.all, 'backorders'] as const,
    list: (filters: Record<string, unknown>) => [...ordersKeys.all, 'backorders', { filters }] as const,
    detail: (id: string) => [...ordersKeys.all, 'backorders', id] as const,
  },
};
