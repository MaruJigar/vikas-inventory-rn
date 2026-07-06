export const approvalsKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...approvalsKeys.lists(), { filters }] as const,
  details: () => [...approvalsKeys.all, 'detail'] as const,
  detail: (id: string) => [...approvalsKeys.details(), id] as const,
};
