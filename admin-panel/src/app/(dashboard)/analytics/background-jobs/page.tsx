'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { analyticsService } from '@/services/analytics.service';
import { ArrowLeft, Server, RefreshCw, CheckCircle2, AlertOctagon, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportExportButton } from '@/components/reporting/ReportExportButton';
import { formatDate } from '@/lib/utils';

export default function BackgroundJobsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getJobPerformance();
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to fetch job performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const summary = data?.summary || {};

  return (
    <RoleGuard allowedRoles={PERMISSIONS.MANUFACTURERS_VIEW}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Server className="w-6 h-6 text-rose-600" />
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Background Job Performance & Queue Health
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Report 1.5: Database-backed asynchronous jobs, latency, retry distribution, and recent failures.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <ReportExportButton
                data={data?.typeBreakdown || []}
                columns={[
                  { header: 'Job Type', accessor: (r: any) => r.jobType },
                  { header: 'Total Enqueued', accessor: (r: any) => r.totalCount },
                  { header: 'Completed Count', accessor: (r: any) => r.completedCount },
                  { header: 'Failed Count', accessor: (r: any) => r.failedCount },
                  { header: 'Avg Latency (Seconds)', accessor: (r: any) => r.avgDurationSeconds },
                ]}
                filename={'background-jobs-performance-' + new Date().toISOString().split('T')[0]}
                disabled={loading || !data?.typeBreakdown?.length}
                label="Export Metrics CSV"
              />
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase">Total Jobs Enqueued</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.totalJobs || 0}</div>
              <div className="text-xs text-gray-400 mt-1">Lifecycle count</div>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase">Completed Jobs</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.completedJobs || 0}</div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {summary.successRatePercentage || 0}% success rate
              </div>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase">Failed Jobs</div>
              <div className="text-2xl font-bold text-rose-600 mt-1">{summary.failedJobs || 0}</div>
              <div className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" /> Requires attention
              </div>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase">Pending / In Flight</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {(summary.pendingJobs || 0) + (summary.processingJobs || 0)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {summary.processingJobs || 0} active workers
              </div>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase">Avg Execution Latency</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {summary.avgExecutionDurationSeconds || 0}s
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Execution duration
              </div>
            </div>
          </div>

          {/* Job Type Breakdown */}
          {data?.typeBreakdown && data.typeBreakdown.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Job Type Performance Breakdown
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-700 text-xs font-medium uppercase">
                    <tr>
                      <th className="p-3">Job Type</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Completed</th>
                      <th className="p-3">Failed</th>
                      <th className="p-3">Avg Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.typeBreakdown.map((t: any) => (
                      <tr key={t.jobType} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-medium text-xs text-slate-800">{t.jobType}</td>
                        <td className="p-3 font-semibold text-gray-900">{t.totalCount}</td>
                        <td className="p-3 text-emerald-600 font-medium">{t.completedCount}</td>
                        <td className="p-3 text-rose-600 font-medium">{t.failedCount}</td>
                        <td className="p-3 text-xs font-mono text-gray-600">{t.avgDurationSeconds}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Failures Table */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b font-semibold text-gray-900 text-sm flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" /> Recent Failed Job Traces
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-gray-700 text-xs font-medium uppercase">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Job Type</th>
                    <th className="p-3">Attempts</th>
                    <th className="p-3">Failed At (IST)</th>
                    <th className="p-3">Error Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!data?.recentFailures || data.recentFailures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        Zero recent job failures. Pipeline healthy!
                      </td>
                    </tr>
                  ) : (
                    data.recentFailures.map((f: any) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs text-gray-500 truncate max-w-[100px]">{f.id}</td>
                        <td className="p-3 font-mono text-xs font-semibold text-slate-800">{f.jobType}</td>
                        <td className="p-3 text-xs text-gray-700">{f.attempts}</td>
                        <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(f.failedAt)}</td>
                        <td className="p-3 text-xs font-mono text-rose-600 max-w-[320px] truncate" title={f.errorMessage}>
                          {f.errorMessage || 'Unknown Error'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}

