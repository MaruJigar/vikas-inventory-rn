'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { ReportDateFilter, ReportingPeriod } from '@/features/analytics/shared/components/ReportDateFilter';
import { analyticsService } from '@/services/analytics.service';
import { ArrowLeft, UserCheck, Factory, Truck, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function PlatformGrowthPage() {
  const [period, setPeriod] = useState<ReportingPeriod>('yearly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGrowth = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getPlatformGrowth({
          period,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        });
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to fetch platform growth:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowth();
  }, [period, startDate, endDate]);

  const summary = data?.summary || {};

  return (
    <RoleGuard allowedRoles={PERMISSIONS.MANUFACTURERS_VIEW}>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/analytics" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Platform Growth & Onboarding Report
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Report 1.3: Partner onboarding velocity, active entities, internal depots, and approval turnaround.
              </p>
            </div>
          </div>

          <ReportDateFilter
            period={period}
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={(p) => setPeriod(p)}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Manufacturers</span>
                <Factory className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {summary.manufacturers?.total || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-emerald-600 font-medium">{summary.manufacturers?.active || 0} Active</span> · {summary.manufacturers?.inactive || 0} Inactive
              </div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Distributors</span>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {summary.distributors?.total || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-blue-600 font-medium">{summary.distributors?.internal || 0} Internal</span> · {summary.distributors?.external || 0} External
              </div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Sales Field Force</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {summary.salesmen?.total || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-emerald-600 font-medium">{summary.salesmen?.active || 0} Active</span> salesmen on field
              </div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Approval Turnaround</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {summary.approvals?.avgTurnaroundHours || 0} hrs
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {summary.approvals?.approved || 0} approved · {summary.approvals?.pending || 0} pending
              </div>
            </div>
          </div>

          {/* Monthly Onboarding Trends */}
          <div className="p-5 bg-white border rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Monthly Entity Registration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-600 mb-2">Manufacturers Onboarded</div>
                <div className="space-y-1.5 text-xs">
                  {data?.trends?.manufacturers && data.trends.manufacturers.length > 0 ? (
                    data.trends.manufacturers.map((t: any, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">{new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <span className="font-semibold text-gray-900">+{t.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No recent data</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-600 mb-2">Distributors Onboarded</div>
                <div className="space-y-1.5 text-xs">
                  {data?.trends?.distributors && data.trends.distributors.length > 0 ? (
                    data.trends.distributors.map((t: any, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">{new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <span className="font-semibold text-gray-900">+{t.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No recent data</div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-gray-600 mb-2">Salesmen Registered</div>
                <div className="space-y-1.5 text-xs">
                  {data?.trends?.salesmen && data.trends.salesmen.length > 0 ? (
                    data.trends.salesmen.map((t: any, i: number) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-500">{new Date(t.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        <span className="font-semibold text-gray-900">+{t.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No recent data</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </RoleGuard>
  );
}

