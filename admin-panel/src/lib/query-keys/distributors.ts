export const distributorsKeys = {
  all: ['distributors'] as const,
  lists: () => [...distributorsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...distributorsKeys.lists(), { filters }] as const,
  details: () => [...distributorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...distributorsKeys.details(), id] as const,
};
