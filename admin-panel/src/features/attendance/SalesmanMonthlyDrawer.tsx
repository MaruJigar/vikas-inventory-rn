import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useSalesmanAttendance } from '@/hooks/attendance/useAttendance';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceStatusBadge } from './status-badges';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesmanId: string | null;
  salesmanName: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onDayClick: (salesmanId: string, salesmanName: string, date: string) => void;
}

export function SalesmanMonthlyDrawer({ open, onOpenChange, salesmanId, salesmanName, startDate, endDate, onDayClick }: Props) {
  const { data, isLoading, isError } = useSalesmanAttendance(salesmanId || '', { startDate, endDate });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{salesmanName}</SheetTitle>
          <SheetDescription>
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(startDate))} 
            {' to '}
            {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(endDate))}
          </SheetDescription>
        </SheetHeader>

        {!salesmanId ? null : isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="text-red-500 text-sm mt-6">Failed to load salesman data.</div>
        ) : (
          <div className="space-y-6 mt-4">
            
            {/* Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border rounded-md p-3">
                 <div className="text-xs font-semibold text-slate-500 mb-1">PRESENT</div>
                 <div className="text-xl font-bold text-slate-800">{data.summary.present_days} <span className="text-sm font-normal text-slate-500">/ {data.summary.applicable_days}</span></div>
              </div>
              <div className="bg-slate-50 border rounded-md p-3">
                 <div className="text-xs font-semibold text-slate-500 mb-1">ABSENT</div>
                 <div className="text-xl font-bold text-slate-800">{data.summary.absent_days} <span className="text-sm font-normal text-slate-500">/ {data.summary.applicable_days}</span></div>
              </div>
              <div className="bg-slate-50 border rounded-md p-3">
                 <div className="text-xs font-semibold text-slate-500 mb-1">TOTAL VISITS</div>
                 <div className="text-xl font-bold text-slate-800">{data.summary.total_visits}</div>
              </div>
              <div className="bg-slate-50 border rounded-md p-3">
                 <div className="text-xs font-semibold text-slate-500 mb-1">AVG / DAY</div>
                 <div className="text-xl font-bold text-slate-800">{data.summary.average_visits_per_present_day}</div>
              </div>
            </div>

            {/* Compact Day Strip */}
            <div>
              <h3 className="font-semibold text-sm text-slate-700 mb-3 border-b pb-2">Daily Breakdown</h3>
              <div className="space-y-2">
                 {data.days.map((day) => {
                   const clickable = day.status === 'PRESENT';
                   return (
                     <div 
                       key={day.date} 
                       className={`flex items-center justify-between p-2 rounded-md border ${clickable ? 'cursor-pointer hover:border-blue-300 hover:bg-blue-50' : 'bg-slate-50/50'}`}
                       onClick={() => clickable ? onDayClick(data.salesman.id, data.salesman.full_name, day.date) : undefined}
                     >
                       <div className="flex items-center gap-4">
                         <div className="text-sm font-medium w-16">{new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(day.date))}</div>
                         <AttendanceStatusBadge status={day.status} />
                       </div>
                       <div className="text-xs font-semibold text-slate-500">
                         {day.visit_count} visits
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
