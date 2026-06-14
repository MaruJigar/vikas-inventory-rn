export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...inventoryKeys.lists(), { filters }] as const,
};
