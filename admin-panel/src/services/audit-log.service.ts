import { api } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { AuditLogDto } from '@/types/api/audit-log.types';

export const auditLogService = {
  getAuditLogs: (params?: QueryParams) => api.get<PaginatedResponse<AuditLogDto>>('/audit-logs', { params }).then(res => res.data),
};
