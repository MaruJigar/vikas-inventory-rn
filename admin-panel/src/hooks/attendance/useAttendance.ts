import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { analyticsKeys } from '@/lib/query-keys/analytics';
import { AttendanceQueryParams } from '@/types/api/attendance.types';

export function useAttendanceSummary(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.attendance.summary(params),
    queryFn: () => analyticsService.getAttendanceSummary(params),
  });
}

export function useDailyAttendance(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.attendance.daily(params),
    queryFn: () => analyticsService.getDailyAttendance(params),
  });
}

export function useMonthlyAttendance(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.attendance.monthly(params),
    queryFn: () => analyticsService.getMonthlyAttendance(params),
  });
}

export function useSalesmanAttendance(salesmanId: string, params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: analyticsKeys.attendance.salesmanDetail(salesmanId, params),
    queryFn: () => analyticsService.getSalesmanAttendance(salesmanId, params),
    enabled: !!salesmanId,
  });
}

export function useSalesmanTimeline(salesmanId: string, date: string) {
  return useQuery({
    queryKey: analyticsKeys.attendance.timeline(salesmanId, date),
    queryFn: () => analyticsService.getSalesmanTimeline(salesmanId, date),
    enabled: !!salesmanId && !!date,
  });
}
