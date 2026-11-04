'use client';

import React, { useState, useEffect } from 'react';
import { SalesSummaryTable } from './SalesSummaryTable';
import { ReportDateFilter, ReportingPeriod } from '@/features/analytics/shared/components/ReportDateFilter';
import { salesSummaryApi } from '../api';
import { SalesReportItem, SalesSummaryResponseData } from '../types';
import { ReportExportButton } from '@/components/reporting/ReportExportButton';
import { IndianRupee, ShoppingCart, Percent, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SalesSummaryReport() {
  const [period, setPeriod] = useState<ReportingPeriod>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [reportData, setReportData] = useState<SalesSummaryResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await salesSummaryApi.getSalesSummary({
        period,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });

      // The backend returns { summary, items, distributorBreakdown, period, dateRange }
      // salesSummaryApi wraps it in { success: true, data: res.data }
      const rawData = res?.data || res;
      setReportData(rawData);
    } catch (err: any) {
      console.error("Failed to fetch sales summary:", err);
      setError(err?.message || "Failed to load sales summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, startDate, endDate]);

  const summary = reportData?.summary || {
    totalOrders: 0,
    totalQuantity: 0,
    grossSales: 0,
    totalDiscounts: 0,
    totalGst: 0,
    netSales: 0,
  };

  const items: SalesReportItem[] = Array.isArray(reportData?.items)
    ? reportData!.items
    : Array.isArray(reportData)
    ? (reportData as any)
    : [];

  const exportColumns = [
    { header: 'Product Name', accessor: (r: SalesReportItem) => r.productName },
    { header: 'SKU', accessor: (r: SalesReportItem) => r.sku || '' },
    { header: 'Category', accessor: (r: SalesReportItem) => r.categoryName || '' },
    { header: 'Quantity Sold', accessor: (r: SalesReportItem) => r.quantitySold },
    { header: 'Gross Line Amount (INR)', accessor: (r: SalesReportItem) => r.grossAmount ?? r.totalRevenue },
    { header: 'Net Revenue (INR)', accessor: (r: SalesReportItem) => r.totalRevenue },
  ];

  const exportFilename = `sales-summary-${period}-${startDate || 'current'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-500">
          Showing data for selected financial cycle and date boundaries.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <ReportExportButton
            data={items}
            columns={exportColumns}
            filename={exportFilename}
            disabled={loading || items.length === 0}
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
            <span>Net Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ₹{Number(summary.netSales || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Gross: ₹{Number(summary.grossSales || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
            <span>Total Units Sold</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {Number(summary.totalQuantity || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Across {Number(summary.totalOrders || 0).toLocaleString()} orders
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
            <span>Discounts Passed</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ₹{Number(summary.totalDiscounts || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Standard, cash & special</div>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium uppercase tracking-wider">
            <span>GST Amount</span>
            <IndianRupee className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            ₹{Number(summary.totalGst || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-1">Total tax component</div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white border rounded-lg shadow-sm">
          Loading report data...
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-white border rounded-lg shadow-sm">
          {error}
        </div>
      ) : (
        <SalesSummaryTable data={items} />
      )}
    </div>
  );
}
