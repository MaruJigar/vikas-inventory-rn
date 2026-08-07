export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...shopsKeys.lists(), { filters }] as const,
  manufacturerLists: () => [...shopsKeys.all, 'manufacturer-list'] as const,
  manufacturerList: (filters: Record<string, unknown>) => [...shopsKeys.manufacturerLists(), { filters }] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
};
