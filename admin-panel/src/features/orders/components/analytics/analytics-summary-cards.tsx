import { OrdersAnalyticsDto } from '@/types/api/analytics.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, TrendingUp, BarChart2, CheckCircle2, XCircle } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  data: OrdersAnalyticsDto | undefined;
  isLoading: boolean;
}

export function AnalyticsSummaryCards({ data, isLoading }: AnalyticsSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totals = data?.totals;
  const statusDistribution = data?.statusDistribution ?? [];

  const totalDelivered = statusDistribution.find((s) => s.status === 'DELIVERED')?.count ?? 0;
  const totalCancelled = statusDistribution.find((s) => s.status === 'CANCELLED')?.count ?? 0;

  const cards = [
    {
      title: 'Total Orders',
      value: (totals?.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingCart,
      iconColor: 'text-indigo-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${(totals?.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      iconColor: 'text-green-500',
    },
    {
      title: 'Avg Order Value',
      value: `₹${Number(totals?.averageOrderValue ?? 0).toLocaleString()}`,
      icon: BarChart2,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Delivered Orders',
      value: totalDelivered.toLocaleString(),
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Cancelled Orders',
      value: totalCancelled.toLocaleString(),
      icon: XCircle,
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
