export const fulfillmentKeys = {
  all: ['fulfillment'] as const,
  lists: () => [...fulfillmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...fulfillmentKeys.lists(), { filters }] as const,
  details: () => [...fulfillmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...fulfillmentKeys.details(), id] as const,
};
