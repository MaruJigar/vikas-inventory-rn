'use client';

import { Suspense, useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';
import { toKolkataDateString } from '@/lib/utils/date';

// Hooks
import { 
  useAttendanceSummary, 
  useDailyAttendance, 
  useMonthlyAttendance 
} from '@/hooks/attendance/useAttendance';

// Components
import { ReportPeriod, ReportPeriodSelector } from '@/features/attendance/ReportPeriodSelector';
import { AttendanceSummaryCards } from '@/features/attendance/AttendanceSummaryCards';
import { DayView } from '@/features/attendance/views/DayView';
import { WeekView } from '@/features/attendance/views/WeekView';
import { MonthCalendarView } from '@/features/attendance/views/MonthCalendarView';
import { CustomRangeView } from '@/features/attendance/views/CustomRangeView';
import { DailyActivityDrawer } from '@/features/attendance/DailyActivityDrawer';
import { SalesmanMonthlyDrawer } from '@/features/attendance/SalesmanMonthlyDrawer';

function AttendancePageContent() {
  const user = useAuthStore(state => state.user);

  // State
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [date, setDate] = useState<Date>(new Date());
  
  // Custom Date Range State
  const [customStart, setCustomStart] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [customEnd, setCustomEnd] = useState<Date>(new Date());

  // Pagination for Day View
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Drawer State
  const [timelineSalesman, setTimelineSalesman] = useState<{ id: string, name: string, date: string } | null>(null);
  const [monthlySalesman, setMonthlySalesman] = useState<{ id: string, name: string } | null>(null);

  // Date Calculation Helpers
  const { startDateStr, endDateStr, dateStr, monthStr, yearStr } = useMemo(() => {
    let start = '';
    let end = '';
    let singleDate = '';
    let month = '';
    let year = '';

    if (period === 'day') {
      singleDate = toKolkataDateString(date);
      start = singleDate;
      end = singleDate;
    } else if (period === 'month') {
      month = (date.getMonth() + 1).toString().padStart(2, '0');
      year = date.getFullYear().toString();
      start = toKolkataDateString(new Date(date.getFullYear(), date.getMonth(), 1));
      end = toKolkataDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    } else if (period === 'week') {
      const d = new Date(date);
      const day = d.getDay() || 7; 
      d.setDate(d.getDate() - day + 1); // Monday
      start = toKolkataDateString(d);
      
      const endD = new Date(d);
      endD.setDate(d.getDate() + 6); // Sunday
      end = toKolkataDateString(endD);
    } else if (period === 'custom') {
      start = toKolkataDateString(customStart);
      end = toKolkataDateString(customEnd);
    }

    return { startDateStr: start, endDateStr: end, dateStr: singleDate, monthStr: month, yearStr: year };
  }, [period, date, customStart, customEnd]);

  // Queries
  const summaryParams = period === 'day' 
     ? { date: dateStr } 
     : period === 'month' ? { month: monthStr, year: yearStr } 
     : { startDate: startDateStr, endDate: endDateStr };

  const { data: summaryData, isLoading: isLoadingSummary } = useAttendanceSummary(summaryParams);

  // Day View specific
  const { data: dailyData, isLoading: isLoadingDaily, isError: isErrorDaily, error: errorDaily } = 
    useDailyAttendance(period === 'day' ? { date: dateStr, page, limit } : undefined);

  // Week / Month / Custom specific
  const { data: monthlyData, isLoading: isLoadingMonthly } = 
    useMonthlyAttendance(period !== 'day' ? summaryParams : undefined);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance & Field Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor salesman check-ins, field activities, and coverage.
          </p>
        </div>

        <ReportPeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          date={date}
          onDateChange={setDate}
          startDate={customStart}
          endDate={customEnd}
          onDateRangeChange={(start, end) => { setCustomStart(start); setCustomEnd(end); }}
        />

        <AttendanceSummaryCards 
          summary={summaryData} 
          isLoading={isLoadingSummary} 
          totalSalesmen={period === 'day' ? dailyData?.summary.salesmen : undefined}
        />

        {period === 'day' && (
          <DayView 
             data={dailyData} 
             isLoading={isLoadingDaily} 
             isError={isErrorDaily} 
             error={errorDaily} 
             onPageChange={setPage} 
             onLimitChange={setLimit}
          />
        )}

        {period === 'week' && (
          <WeekView 
             data={monthlyData as any} 
             isLoading={isLoadingMonthly} 
             onCellClick={(id, name, d) => setTimelineSalesman({ id, name, date: d })}
             onSalesmanClick={(id, name) => setMonthlySalesman({ id, name })}
          />
        )}

        {period === 'month' && (
          <MonthCalendarView 
             data={monthlyData} 
             isLoading={isLoadingMonthly} 
             onCellClick={(id, name, d) => setTimelineSalesman({ id, name, date: d })}
             onSalesmanClick={(id, name) => setMonthlySalesman({ id, name })}
          />
        )}

        {period === 'custom' && (
          <CustomRangeView 
             data={monthlyData} 
             isLoading={isLoadingMonthly} 
             onCellClick={(id, name, d) => setTimelineSalesman({ id, name, date: d })}
             onSalesmanClick={(id, name) => setMonthlySalesman({ id, name })}
          />
        )}

        <DailyActivityDrawer 
          open={!!timelineSalesman} 
          onOpenChange={(open) => !open && setTimelineSalesman(null)}
          salesmanId={timelineSalesman?.id || null}
          date={timelineSalesman?.date || null}
        />

        <SalesmanMonthlyDrawer
          open={!!monthlySalesman}
          onOpenChange={(open) => !open && setMonthlySalesman(null)}
          salesmanId={monthlySalesman?.id || null}
          salesmanName={monthlySalesman?.name || null}
          startDate={startDateStr}
          endDate={endDateStr}
          onDayClick={(id, name, d) => setTimelineSalesman({ id, name, date: d })}
        />
      </div>
    </AppLayout>
  );
}

export default function AttendancePage() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN']}>
      <Suspense fallback={<div className="p-8"><Skeleton className="h-[400px] w-full" /></div>}>
        <AttendancePageContent />
      </Suspense>
    </RoleGuard>
  );
}
