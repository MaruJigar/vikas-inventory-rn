import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceSummaryDto } from '@/types/api/attendance.types';
import { Users, CheckCircle2, XCircle, Footprints, Clock, CheckSquare } from 'lucide-react';

interface Props {
  summary?: AttendanceSummaryDto;
  isLoading: boolean;
  totalSalesmen?: number; // optionally pass this if you want to display the total tracked for that day
}

export function AttendanceSummaryCards({ summary, isLoading, totalSalesmen }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const applicable = summary?.applicable_days || 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {totalSalesmen !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">TOTAL SALESMEN</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSalesmen}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-600">PRESENT</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {summary?.present_days || 0} {applicable > 0 ? `/ ${applicable}` : ''}
          </div>
          {totalSalesmen === undefined && <p className="text-xs text-muted-foreground mt-1">days recorded</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-red-600">ABSENT</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {summary?.absent_days || 0} {applicable > 0 ? `/ ${applicable}` : ''}
          </div>
          {totalSalesmen === undefined && <p className="text-xs text-muted-foreground mt-1">days missing</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-600">TOTAL VISITS</CardTitle>
          <Footprints className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {summary?.total_visits || 0}
          </div>
        </CardContent>
      </Card>

      {totalSalesmen !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">ACTIVE / COMPLETED</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-baseline gap-2">
               <span className="text-blue-600">{summary?.active || 0}</span>
               <span className="text-sm font-normal text-muted-foreground">/</span>
               <span className="text-green-600">{summary?.completed || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
