export type ReportingPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export interface DateRange {
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;
}

/**
 * Resolves standard financial/calendar boundaries based on Indian Standard Time convention
 * Fiscal Year: April 1 to March 31
 */
export function resolvePeriodDateRange(
  period?: ReportingPeriod,
  customStart?: string,
  customEnd?: string,
): DateRange {
  const now = new Date();

  if (period === 'custom' || (!period && (customStart || customEnd))) {
    const startDate = customStart || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = customEnd || now.toISOString();
    return { startDate, endDate };
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case 'daily': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'weekly': {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'quarterly': {
      // Indian Financial Quarters:
      // Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
      const currentMonth = now.getMonth(); // 0-indexed (0=Jan)
      let qStartMonth = 0;
      let qStartYear = now.getFullYear();

      if (currentMonth >= 3 && currentMonth <= 5) {
        qStartMonth = 3; // April
      } else if (currentMonth >= 6 && currentMonth <= 8) {
        qStartMonth = 6; // July
      } else if (currentMonth >= 9 && currentMonth <= 11) {
        qStartMonth = 9; // October
      } else {
        qStartMonth = 0; // January
      }

      const start = new Date(qStartYear, qStartMonth, 1, 0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'yearly': {
      // Indian Financial Year: Starts April 1st
      const currentMonth = now.getMonth();
      const fyStartYear = currentMonth >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const start = new Date(fyStartYear, 3, 1, 0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    default: {
      if (customStart && customEnd) {
        return { startDate: customStart, endDate: customEnd };
      }
      // Default to current month
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
  }
}

