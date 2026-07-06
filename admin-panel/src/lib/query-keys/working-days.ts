export const workingDaysKeys = {
  all: ['working-days'] as const,
  lists: () => [...workingDaysKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...workingDaysKeys.lists(), { filters }] as const,
};
