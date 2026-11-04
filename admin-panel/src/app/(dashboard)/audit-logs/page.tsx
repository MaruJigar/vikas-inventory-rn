'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { useAuditLogsQuery } from '@/features/audit-logs/hooks';
import { auditLogsService } from '@/features/audit-logs/services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Download, RefreshCw, Search, ShieldCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const queryParams = {
    page,
    limit: 20,
    ...(search ? { search } : {}),
    ...(action ? { action } : {}),
    ...(entityType ? { entity_type: entityType } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data, isLoading, isError, refetch } = useAuditLogsQuery(queryParams);

  const handleExport = async () => {
    try {
      await auditLogsService.exportCsv(queryParams);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  return (
    <RoleGuard allowedRoles={PERMISSIONS.AUDIT_LOGS_VIEW}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  System Audit & Security Logs
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Report 1.1: Complete tamper-evident log of platform operations and security events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Button variant="default" size="sm" onClick={handleExport} className="bg-slate-900 text-white">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white border rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Search</label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                <Input
                  placeholder="Keyword..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Action</label>
              <Input
                placeholder="e.g. CREATE, LOGIN"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  setPage(1);
                }}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Entity Type</label>
              <Input
                placeholder="e.g. Order, Shop"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                  setPage(1);
                }}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          {/* Log Table */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-gray-700 font-medium">
                  <tr>
                    <th className="p-3">Timestamp (IST)</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">Entity ID</th>
                    <th className="p-3">Actor User ID</th>
                    <th className="p-3">Actor Role</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-red-500">
                        Failed to load audit logs. Please try again.
                      </td>
                    </tr>
                  ) : !data?.data || data.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No audit logs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    data.data.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 whitespace-nowrap text-xs font-mono text-gray-600">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-gray-800">{log.entity_type}</td>
                        <td className="p-3 text-xs font-mono text-gray-500 truncate max-w-[120px]" title={log.entity_id || ''}>
                          {log.entity_id || '—'}
                        </td>
                        <td className="p-3 text-xs font-mono text-gray-500 truncate max-w-[120px]" title={log.actor_user_id || ''}>
                          {log.actor_user_id || 'SYSTEM'}
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          {log.actor_role || '—'}
                        </td>
                        <td className="p-3 text-xs font-mono text-gray-500">
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data && data.totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing page {data.page} of {data.totalPages} ({data.total} total events)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}

