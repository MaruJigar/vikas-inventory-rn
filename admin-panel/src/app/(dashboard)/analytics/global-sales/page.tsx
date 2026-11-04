'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/config/permissions';
import { ReportDateFilter, ReportingPeriod } from '@/features/analytics/shared/components/ReportDateFilter';
import { salesSummaryApi } from '@/features/analytics/sales/sales-summary/api';
import { ReportExportButton } from '@/components/reporting/ReportExportButton';
import { ArrowLeft, TrendingUp, IndianRupee, ShoppingCart, Percent, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalSalesPage() {
  const [period, setPeriod] = useState<ReportingPeriod>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await salesSummaryApi.getSalesSummary({
        period,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
      setData(res?.data || res);
    } catch (err) {
      console.error('Failed to fetch global sales summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [period, startDate, endDate]);

  const summary = data?.summary || {};
  const distributorList = Array.isArray(data?.distributorBreakdown) ? data.distributorBreakdown : [];

  const exportColumns = [
    { header: 'Distributor Name', accessor: (r: any) => r.distributorName },
    { header: 'Distributor ID', accessor: (r: any) => r.distributorId },
    { header: 'Order Count', accessor: (r: any) => r.orderCount },
    { header: 'Total Revenue (INR)', accessor: (r: any) => r.totalRevenue },
  ];

  const exportFilename = `global-sales-distributors-${period}-${startDate || 'current'}`;

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
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Global Sales & GMV Summary
                  </h1>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Report 1.2: Platform-wide gross merchandise value, net sales, tax liability, and discounts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loading}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ReportExportButton
                data={distributorList}
                columns={exportColumns}
                filename={exportFilename}
                disabled={loading || distributorList.length === 0}
                label="Export Distributors CSV"
              />
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

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Gross GMV</span>
                <IndianRupee className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                ₹{Number(summary.grossSales || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-1">Total before discounts & tax</div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Net Revenue</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                ₹{Number(summary.netSales || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-1">Final billed revenue</div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Total Tax (GST)</span>
                <Percent className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                ₹{Number(summary.totalGst || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-1">Collected tax liability</div>
            </div>

            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
                <span>Total Orders</span>
                <ShoppingCart className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {Number(summary.totalOrders || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Number(summary.totalQuantity || 0).toLocaleString()} units sold
              </div>
            </div>
          </div>

          {/* Distributor Breakdown Table */}
          {distributorList.length > 0 && (
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b font-semibold text-gray-900 text-sm">
                Distributor-Wise Performance Breakdown ({distributorList.length} Distributors)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-700 text-xs uppercase font-medium">
                    <tr>
                      <th className="p-3">Distributor Name</th>
                      <th className="p-3">Order Count</th>
                      <th className="p-3">Total Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {distributorList.map((d: any) => (
                      <tr key={d.distributorId} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-900">{d.distributorName}</td>
                        <td className="p-3 text-gray-600">{d.orderCount}</td>
                        <td className="p-3 font-semibold text-gray-900">
                          ₹{Number(d.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
