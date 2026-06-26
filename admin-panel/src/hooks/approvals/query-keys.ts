export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...approvalKeys.lists(), params] as const,
};
