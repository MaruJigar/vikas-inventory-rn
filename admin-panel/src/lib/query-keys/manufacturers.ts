export const manufacturersKeys = {
  all: ['manufacturers'] as const,
  profile: () => [...manufacturersKeys.all, 'profile'] as const,
  lists: () => [...manufacturersKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...manufacturersKeys.lists(), { filters }] as const,
  details: () => [...manufacturersKeys.all, 'detail'] as const,
  detail: (id: string) => [...manufacturersKeys.details(), id] as const,
};
