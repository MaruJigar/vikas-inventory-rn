import { OrdersAnalyticsStatusItem } from '@/types/api/analytics.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface AnalyticsStatusDistributionProps {
  data: OrdersAnalyticsStatusItem[] | undefined;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, { bar: string; badge: string }> = {
  CREATED:             { bar: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  CONFIRMED:           { bar: 'bg-blue-400',    badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING:          { bar: 'bg-indigo-400',  badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  PACKED:              { bar: 'bg-violet-400',  badge: 'bg-violet-100 text-violet-800 border-violet-200' },
  DISPATCHED:          { bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  DELIVERED:           { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED:           { bar: 'bg-red-400',     badge: 'bg-red-100 text-red-800 border-red-200' },
  PARTIALLY_DISPATCHED:{ bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  PARTIALLY_DELIVERED: { bar: 'bg-teal-400',    badge: 'bg-teal-100 text-teal-800 border-teal-200' },
};

const STATUS_LABELS: Record<string, string> = {
  CREATED:             'Created',
  CONFIRMED:           'Confirmed',
  PROCESSING:          'Processing',
  PACKED:              'Packed',
  DISPATCHED:          'Dispatched',
  DELIVERED:           'Delivered',
  CANCELLED:           'Cancelled',
  PARTIALLY_DISPATCHED:'Partially Dispatched',
  PARTIALLY_DELIVERED: 'Partially Delivered',
};

export function AnalyticsStatusDistribution({ data, isLoading }: AnalyticsStatusDistributionProps) {
  const total = data?.reduce((sum, s) => sum + s.count, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
        <PieChart className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No status data for selected period.
          </p>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const colors = STATUS_COLORS[item.status] ?? {
                bar: 'bg-slate-300',
                badge: 'bg-slate-100 text-slate-700 border-slate-200',
              };
              const label = STATUS_LABELS[item.status] ?? item.status;

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors.badge}`}
                    >
                      {label}
                    </span>
                    <span className="font-medium text-slate-800">
                      {item.count.toLocaleString()}
                      <span className="text-slate-400 font-normal ml-1">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
