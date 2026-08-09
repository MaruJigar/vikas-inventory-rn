import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useSalesmanTimeline } from '@/hooks/attendance/useAttendance';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKolkataTime, formatDuration, toKolkataDateString } from '@/lib/utils/date';
import { MapPin, CheckCircle2, Clock, Footprints } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesmanId: string | null;
  date: string | null; // YYYY-MM-DD
}

export function DailyActivityDrawer({ open, onOpenChange, salesmanId, date }: Props) {
  const { data, isLoading, isError } = useSalesmanTimeline(salesmanId || '', date || '');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Daily Activity</SheetTitle>
          {date && (
             <SheetDescription>
               {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date(date))}
             </SheetDescription>
          )}
        </SheetHeader>

        {!salesmanId || !date ? null : isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="text-red-500 text-sm mt-6">Failed to load activity timeline.</div>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="font-semibold text-lg">{data.salesman.full_name}</div>
            
            {/* Summaries */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border rounded-md p-3 flex flex-col items-center justify-center text-center">
                <span className={`text-xs font-semibold mb-1 ${data.attendance?.status === 'ACTIVE' ? 'text-blue-600' : 'text-slate-600'}`}>
                  {data.attendance ? `● ${data.attendance.status}` : 'NO ATTENDANCE'}
                </span>
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <div className="bg-slate-50 border rounded-md p-3 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold mb-1 text-slate-700 flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-blue-500" /> {data.visits.length}
                </span>
                <span className="text-xs text-muted-foreground">Visits</span>
              </div>
              <div className="bg-slate-50 border rounded-md p-3 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-semibold mb-1 text-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> {data.attendance ? formatDuration(data.attendance.duration_minutes) : '—'}
                </span>
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 mt-8 ml-3 pb-8">
              {data.attendance && (
                <div className="relative">
                  <div className="absolute -left-[31px] bg-white rounded-full p-1 border-2 border-blue-500">
                     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">{formatKolkataTime(data.attendance.check_in_at)}</div>
                  <div className="text-sm font-bold text-blue-600 uppercase mt-0.5 tracking-tight">CHECK IN</div>
                  {data.attendance.check_in_location && (
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {data.attendance.check_in_location.latitude.toFixed(4)}, {data.attendance.check_in_location.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              )}

              {data.visits.map((visit) => (
                <div key={visit.id} className="relative">
                  <div className="absolute -left-[31px] bg-white rounded-full p-1.5 border-2 border-slate-300">
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">{formatKolkataTime(visit.started_at)}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    🏪 {visit.shop.name}
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Visit {visit.status.toLowerCase()}
                  </div>
                  {visit.start_location && (
                    <div className="flex items-center text-xs text-slate-500 mt-1.5">
                      <MapPin className="w-3 h-3 mr-1" />
                      {visit.start_location.latitude.toFixed(4)}, {visit.start_location.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              ))}

              {data.attendance?.check_out_at && (
                <div className="relative">
                  <div className="absolute -left-[31px] bg-white rounded-full p-1 border-2 border-slate-700">
                     <div className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">{formatKolkataTime(data.attendance.check_out_at)}</div>
                  <div className="text-sm font-bold text-slate-700 uppercase mt-0.5 tracking-tight">CHECK OUT</div>
                  {data.attendance.check_out_location && (
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {data.attendance.check_out_location.latitude.toFixed(4)}, {data.attendance.check_out_location.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              )}

              {data.attendance && !data.attendance.check_out_at && (
                 <div className="relative pt-2">
                   <div className="absolute -left-[31px] bg-white rounded-full p-1 border-2 border-blue-400 border-dashed animate-pulse">
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                   </div>
                   <div className="text-sm font-bold text-blue-500 tracking-tight">CURRENTLY ACTIVE</div>
                 </div>
              )}
              
              {!data.attendance && data.visits.length === 0 && (
                <div className="text-sm text-slate-500 italic mt-4 -ml-6">No activity recorded on this day.</div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
