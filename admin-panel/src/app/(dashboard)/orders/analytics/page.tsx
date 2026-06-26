'use client';

import { Suspense, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useOrdersAnalyticsQuery } from '@/hooks/orders/useOrdersAnalyticsQuery';
import { AnalyticsSummaryCards } from '@/features/orders/components/analytics/analytics-summary-cards';
import { AnalyticsDateFilter } from '@/features/orders/components/analytics/analytics-date-filter';
import { AnalyticsStatusDistribution } from '@/features/orders/components/analytics/analytics-status-distribution';
import { AnalyticsRevenueTrendChart } from '@/features/orders/components/analytics/analytics-revenue-trend-chart';
import { AnalyticsSalesmanLeaderboard } from '@/features/orders/components/analytics/analytics-salesman-leaderboard';
import { AnalyticsDistributorLeaderboard } from '@/features/orders/components/analytics/analytics-distributor-leaderboard';

function OrdersAnalyticsContent() {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const params = {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const { data, isLoading, isError, error } = useOrdersAnalyticsQuery(params);

  const analytics = data?.data;

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue trends, order performance, and leaderboards.
            </p>
          </div>
        </div>

        {/* Section 2 — Date Range Filter */}
        <AnalyticsDateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={handleClear}
        />

        {/* Error State */}
        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load analytics data</p>
              <p className="text-sm text-red-600 mt-0.5">
                {error instanceof Error ? error.message : 'An unexpected error occurred.'}
              </p>
            </div>
          </div>
        )}

        {/* Empty State — loaded but no data */}
        {!isLoading && !isError && analytics && analytics.totals.totalOrders === 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No analytics data available for selected period.
            </p>
          </div>
        )}

        {/* Section 1 — KPI Summary Cards */}
        <AnalyticsSummaryCards data={analytics} isLoading={isLoading} />

        {/* Section 4 — Revenue Trend (full-width) */}
        <AnalyticsRevenueTrendChart data={analytics?.trends} isLoading={isLoading} />

        {/* Section 3 + Leaderboards (2-col grid) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Section 3 — Status Distribution */}
          <div className="lg:col-span-1">
            <AnalyticsStatusDistribution
              data={analytics?.statusDistribution}
              isLoading={isLoading}
            />
          </div>

          {/* Section 5 — Salesman Leaderboard */}
          <div className="lg:col-span-1">
            <AnalyticsSalesmanLeaderboard
              data={analytics?.topSalesmen}
              isLoading={isLoading}
            />
          </div>

          {/* Section 6 — Distributor Leaderboard */}
          <div className="lg:col-span-1">
            <AnalyticsDistributorLeaderboard
              data={analytics?.topDistributors}
              isLoading={isLoading}
            />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

export default function OrdersAnalyticsPage() {
  return (
    <RoleGuard>
      <Suspense
        fallback={
          <AppLayout>
            <div className="space-y-6 p-6">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-14 w-full rounded-lg" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </AppLayout>
        }
      >
        <OrdersAnalyticsContent />
      </Suspense>
    </RoleGuard>
  );
}
