import { MonthlySalesmanReport } from '@/types/api/attendance.types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data?: MonthlySalesmanReport[];
  isLoading: boolean;
  year: number;
  onMonthClick: (monthIndex: number) => void;
}

export function YearView({ data, isLoading, year, onMonthClick }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-8 text-center text-slate-500">
        No attendance records for {year}.
      </div>
    );
  }

  // Aggregate stats per month
  const monthStats = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    monthName: new Date(year, i, 1).toLocaleString('en-US', { month: 'long' }),
    present: 0,
    absent: 0,
    visits: 0
  }));

  data.forEach(salesman => {
    salesman.days.forEach(day => {
      const dayDate = new Date(day.date);
      const mIdx = dayDate.getMonth();
      if (day.status === 'PRESENT') {
         monthStats[mIdx].present++;
         monthStats[mIdx].visits += day.visit_count;
      } else if (day.status === 'ABSENT' || day.status === 'HOLIDAY') {
         monthStats[mIdx].absent++;
      }
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {monthStats.map((stat) => (
        <button
          key={stat.monthIndex}
          onClick={() => onMonthClick(stat.monthIndex)}
          className="bg-white rounded-md border shadow-sm p-4 text-left hover:border-indigo-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
        >
          <h3 className="font-semibold text-lg text-slate-800 mb-4 group-hover:text-indigo-600">
            {stat.monthName}
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
             <div className="flex justify-between items-center bg-green-50 px-2 py-1.5 rounded-sm">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Present</span>
                <span className="font-semibold text-green-700">{stat.present}</span>
             </div>
             <div className="flex justify-between items-center bg-red-50 px-2 py-1.5 rounded-sm">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border-2 border-red-500" /> Absent</span>
                <span className="font-semibold text-red-700">{stat.absent}</span>
             </div>
             <div className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-sm mt-2 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">Total Visits</span>
                <span className="font-semibold">{stat.visits}</span>
             </div>
          </div>
        </button>
      ))}
    </div>
  );
}
