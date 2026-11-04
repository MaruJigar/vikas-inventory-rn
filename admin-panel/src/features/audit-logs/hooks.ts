import { useQuery } from '@tanstack/react-query';
import { auditLogsService } from './services';
import { AuditLogQueryParams } from './types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (params?: AuditLogQueryParams) => [...auditLogKeys.all, 'list', params] as const,
};

export function useAuditLogsQuery(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogsService.getAuditLogs(params),
  });
}
