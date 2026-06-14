export const auditLogsKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...auditLogsKeys.lists(), { filters }] as const,
  details: () => [...auditLogsKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditLogsKeys.details(), id] as const,
};
