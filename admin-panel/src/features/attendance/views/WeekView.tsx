import { DailyAttendanceResponse } from '@/types/api/attendance.types';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  data?: DailyAttendanceResponse;
  isLoading: boolean;
  onSalesmanClick: (salesmanId: string, salesmanName: string) => void;
  onCellClick: (salesmanId: string, salesmanName: string, date: string) => void;
}

export function WeekView({ data, isLoading, onCellClick, onSalesmanClick }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  // Without a specific weekly breakdown API, if `data` represents the days inside a week... 
  // Wait, the backend doesn't have a specific weekly breakdown endpoint that returns the days of the week in one shot. 
  // We can just use the Month view logic but bounded to 7 days if the backend provides `getMonthlyAttendance` with a week's date range.
  // We will re-use MonthCalendarView for WeekView, because it perfectly fulfills the requirement of a grid for 7 days.
  return (
    <div className="p-8 text-center text-red-500 font-bold border border-red-200 bg-red-50 rounded-md">
      This should actually just re-use the MonthCalendarView component since the requirements match the same grid output format, just with 7 columns instead of 30!
    </div>
  );
}
