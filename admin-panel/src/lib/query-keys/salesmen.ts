export const salesmenKeys = {
  all: ['salesmen'] as const,
  lists: () => [...salesmenKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...salesmenKeys.lists(), { filters }] as const,
  details: () => [...salesmenKeys.all, 'detail'] as const,
  detail: (id: string) => [...salesmenKeys.details(), id] as const,
};
