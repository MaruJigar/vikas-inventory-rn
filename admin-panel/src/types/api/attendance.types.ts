export interface AttendanceSummaryDto {
  start_date: string;
  end_date: string;
  applicable_days: number;
  present_days: number;
  absent_days: number;
  active: number;
  completed: number;
  total_visits: number;
}

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
}

export interface SalesmanAttendanceRecord {
  status: 'ACTIVE' | 'COMPLETED';
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number;
  check_in_location: AttendanceLocation | null;
  check_out_location: AttendanceLocation | null;
}

export interface DailySalesmanReport {
  salesman: {
    id: string;
    full_name: string;
  };
  attendance: SalesmanAttendanceRecord | null;
  status: 'PRESENT' | 'ABSENT' | 'NON_WORKING_DAY' | 'HOLIDAY';
  visits: {
    count: number;
  };
}

export interface DailyAttendanceResponse {
  date: string;
  summary: {
    salesmen: number;
    present: number;
    absent: number;
    active: number;
    completed: number;
    total_visits: number;
  };
  data: DailySalesmanReport[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MonthlyDayRecord {
  date: string;
  applicable: boolean;
  status: 'PRESENT' | 'ABSENT' | 'NON_WORKING_DAY' | 'HOLIDAY';
  check_in_at: string | null;
  check_out_at: string | null;
  visit_count: number;
}

export interface MonthlySalesmanReport {
  salesman: {
    id: string;
    full_name: string;
  };
  summary: {
    applicable_days: number;
    present_days: number;
    absent_days: number;
    total_visits: number;
  };
  days: MonthlyDayRecord[];
}

export interface SalesmanDetailReport {
  salesman: {
    id: string;
    full_name: string;
  };
  summary: {
    applicable_days: number;
    present_days: number;
    absent_days: number;
    total_visits: number;
    average_visits_per_present_day: number;
  };
  days: MonthlyDayRecord[];
}

export interface TimelineVisit {
  id: string;
  shop: {
    id: string;
    name: string;
  };
  started_at: string;
  ended_at: string | null;
  status: string;
  start_location: AttendanceLocation | null;
  end_location: AttendanceLocation | null;
}

export interface DailyActivityTimelineResponse {
  date: string;
  salesman: {
    id: string;
    full_name: string;
  };
  attendance: SalesmanAttendanceRecord | null;
  visits: TimelineVisit[];
}

export type AttendanceQueryParams = {
  startDate?: string;
  endDate?: string;
  date?: string;
  month?: string;
  year?: string;
  salesman_id?: string;
  distributor_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};
