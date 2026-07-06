import { OrdersAnalyticsLeaderboardItem } from '@/types/api/analytics.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

interface AnalyticsDistributorLeaderboardProps {
  data: OrdersAnalyticsLeaderboardItem[] | undefined;
  isLoading: boolean;
}

export function AnalyticsDistributorLeaderboard({ data, isLoading }: AnalyticsDistributorLeaderboardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Top Distributors</CardTitle>
        <Building2 className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No distributor data for selected period.
          </p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 pb-2 border-b">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Distributor</div>
              <div className="col-span-3 text-right">Orders</div>
              <div className="col-span-3 text-right">Revenue</div>
            </div>
            {data.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center py-2.5 text-sm border-b last:border-0"
              >
                <div className="col-span-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                      ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-slate-100 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-50 text-slate-500'}`}
                  >
                    {index + 1}
                  </span>
                </div>
                {/* Render distributor.business_name — never distributor_id */}
                <div className="col-span-5 font-medium text-slate-800 truncate">
                  {item.name || 'N/A'}
                </div>
                <div className="col-span-3 text-right text-slate-600">
                  {item.orderCount.toLocaleString()}
                </div>
                <div className="col-span-3 text-right font-medium text-slate-800">
                  ₹{item.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
