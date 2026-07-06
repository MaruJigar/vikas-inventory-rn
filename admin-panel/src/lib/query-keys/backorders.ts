export const backordersKeys = {
  all: ['backorders'] as const,
  lists: () => [...backordersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...backordersKeys.lists(), { filters }] as const,
  details: () => [...backordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...backordersKeys.details(), id] as const,
};
