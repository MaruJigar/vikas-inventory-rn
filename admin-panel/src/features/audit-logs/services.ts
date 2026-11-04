import { api } from '@/lib/api/axios';
import { AuditLogQueryParams, PaginatedAuditLogs } from './types';

export const auditLogsService = {
  getAuditLogs: (params?: AuditLogQueryParams) =>
    api.get<PaginatedAuditLogs>('/audit-logs', { params }).then((res) => res.data),

  exportCsv: async (params?: AuditLogQueryParams) => {
    const res = await api.get('/audit-logs/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
