export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...shopsKeys.lists(), { filters }] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
};
