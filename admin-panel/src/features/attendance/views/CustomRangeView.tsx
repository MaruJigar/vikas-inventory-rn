import { MonthlySalesmanReport } from '@/types/api/attendance.types';
import { AttendanceStatusBadge } from '../status-badges';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data?: MonthlySalesmanReport[];
  isLoading: boolean;
  onCellClick: (salesmanId: string, salesmanName: string, date: string) => void;
  onSalesmanClick: (salesmanId: string, salesmanName: string) => void;
}

export function CustomRangeView({ data, isLoading, onCellClick, onSalesmanClick }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-8 text-center text-slate-500">
        No attendance records for this period.
      </div>
    );
  }

  // Assuming all salesmen have the exact same days array in terms of dates
  const daysHeader = data[0].days.map(d => {
     const dateObj = new Date(d.date);
     return {
       date: d.date,
       dayNum: dateObj.getDate().toString().padStart(2, '0'),
       dayName: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj),
       monthName: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj)
     };
  });

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden flex flex-col relative">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-700 bg-slate-50 border-b sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 sticky left-0 bg-slate-50 border-r min-w-[200px] z-20">
                SALESMAN
              </th>
              {daysHeader.map((h, i) => (
                <th key={i} scope="col" className="px-2 py-3 text-center border-r min-w-[64px]">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground font-normal text-[10px] uppercase leading-none">{h.monthName}</span>
                    <span className="font-bold text-sm leading-none mt-1">{h.dayNum}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((salesmanRow) => (
              <tr key={salesmanRow.salesman.id} className="border-b hover:bg-slate-50/50">
                <td className="px-4 py-3 sticky left-0 bg-white border-r font-medium z-10 hover:bg-slate-50">
                  <button 
                    className="hover:underline text-left outline-none focus:ring-2 focus:ring-indigo-500 rounded-sm"
                    onClick={() => onSalesmanClick(salesmanRow.salesman.id, salesmanRow.salesman.full_name)}
                  >
                    {salesmanRow.salesman.full_name}
                  </button>
                  <div className="text-xs text-muted-foreground mt-1 font-normal flex gap-3">
                     <span>P: {salesmanRow.summary.present_days}</span>
                     <span>A: {salesmanRow.summary.absent_days}</span>
                  </div>
                </td>
                {salesmanRow.days.map((day, i) => {
                  let badge = null;
                  let displayCount = '';
                  
                  if (day.status === 'PRESENT') {
                    badge = <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0" title="Present" />;
                    displayCount = day.visit_count.toString();
                  } else if (day.status === 'ABSENT') {
                    badge = <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0" title="Absent" />;
                    displayCount = '0';
                  } else if (day.status === 'HOLIDAY') {
                    badge = <div className="w-3 h-3 bg-amber-500 rotate-45 shrink-0" title="Holiday" />;
                    displayCount = '—';
                  } else {
                    // NON_WORKING_DAY
                    badge = <div className="w-4 h-0.5 bg-slate-300 shrink-0" title="Non-working day" />;
                    displayCount = '—';
                  }

                  const clickable = day.status === 'PRESENT';

                  return (
                    <td key={i} className="px-1 py-2 text-center border-r align-middle">
                       <button
                         disabled={!clickable}
                         onClick={() => clickable ? onCellClick(salesmanRow.salesman.id, salesmanRow.salesman.full_name, day.date) : undefined}
                         className={`w-full flex flex-col items-center justify-center gap-1.5 p-2 rounded-md transition-colors ${clickable ? 'hover:bg-slate-100 cursor-pointer active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500' : 'cursor-default'}`}
                       >
                         {badge}
                         <span className={`text-xs font-medium ${clickable ? 'text-slate-700' : 'text-slate-400'}`}>
                           {displayCount}
                         </span>
                       </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
