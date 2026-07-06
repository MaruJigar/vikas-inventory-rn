export const visitsKeys = {
  all: ['visits'] as const,
  lists: () => [...visitsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...visitsKeys.lists(), { filters }] as const,
  details: () => [...visitsKeys.all, 'detail'] as const,
  detail: (id: string) => [...visitsKeys.details(), id] as const,
};
