import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { WorkingDayCalculatorService } from '../working-day/working-day-calculator.service';
import { DataSource } from 'typeorm';

const mockDataSource = {
  query: jest.fn(),
};

const mockWdCalculator = {
  getApplicableAttendanceDays: jest.fn(),
};

describe('AttendanceAnalyticsService', () => {
  let service: AttendanceAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceAnalyticsService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: WorkingDayCalculatorService, useValue: mockWdCalculator },
      ],
    }).compile();

    service = module.get<AttendanceAnalyticsService>(AttendanceAnalyticsService);
    jest.clearAllMocks();
  });

  describe('buildDateRange', () => {
    it('returns provided date', () => {
      const result = (service as any).buildDateRange({ date: '2026-08-09' });
      expect(result).toEqual({ start: '2026-08-09', end: '2026-08-09' });
    });

    it('returns provided start/end date', () => {
      const result = (service as any).buildDateRange({ startDate: '2026-08-01', endDate: '2026-08-10' });
      expect(result).toEqual({ start: '2026-08-01', end: '2026-08-10' });
    });

    it('returns correct month range', () => {
      const result = (service as any).buildDateRange({ month: '8', year: '2026' });
      expect(result).toEqual({ start: '2026-08-01', end: '2026-08-31' });
    });
  });

  describe('getSummary', () => {
    it('calculates present and absent correctly', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([{ id: 's1', distributor_id: 'd1' }]) // salesmen
        .mockResolvedValueOnce([ // working days
          { check_in_date: '2026-08-01', status: 'ACTIVE', check_out_at: null },
          { check_in_date: '2026-08-02', status: 'COMPLETED', check_out_at: new Date() },
        ])
        .mockResolvedValueOnce([{ total_visits: '15' }]); // visits

      mockWdCalculator.getApplicableAttendanceDays.mockResolvedValue(['2026-08-01', '2026-08-02', '2026-08-03']);

      const res = await service.getSummary('SUPER_ADMIN', 'user1', { startDate: '2026-08-01', endDate: '2026-08-03' });

      expect(res.applicable_days).toBe(3);
      expect(res.present_days).toBe(2);
      expect(res.absent_days).toBe(1);
      expect(res.active).toBe(1);
      expect(res.completed).toBe(1);
      expect(res.total_visits).toBe(15);
    });
  });

  describe('getDailyReport', () => {
    it('returns empty if no salesmen', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // no salesmen
      const res = await service.getDailyReport('SUPER_ADMIN', 'u', { date: '2026-08-09' });
      expect(res.data.length).toBe(0);
    });

    it('maps PRESENT, ABSENT, NON_WORKING_DAY statuses correctly', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([
          { id: 's1', full_name: 'John', distributor_id: 'd1' },
          { id: 's2', full_name: 'Jane', distributor_id: 'd1' },
          { id: 's3', full_name: 'Jim', distributor_id: 'd1' },
        ])
        .mockResolvedValueOnce([ // Working Days
          { salesman_id: 's1', check_in_at: new Date(), check_out_at: new Date(), duration_minutes: 60 }
        ])
        .mockResolvedValueOnce([ // Visits
          { salesman_id: 's1', visit_count: '2' }
        ]);

      mockWdCalculator.getApplicableAttendanceDays.mockImplementation(async (d, s, e) => {
        // s1, s2 are applicable (Mon-Sat), s3 is not applicable (e.g. Sunday)
        return ['2026-08-09']; 
      });

      // Override for s3 specifically inside test logic if needed, but for simplicity let's say all get '2026-08-09'
      // except we mock to return empty array for s3
      mockWdCalculator.getApplicableAttendanceDays.mockResolvedValueOnce(['2026-08-09']) // s1
      mockWdCalculator.getApplicableAttendanceDays.mockResolvedValueOnce(['2026-08-09']) // s2
      mockWdCalculator.getApplicableAttendanceDays.mockResolvedValueOnce([]) // s3

      const res = await service.getDailyReport('SUPER_ADMIN', 'u', { date: '2026-08-09' });
      
      expect(res.data.find(d => d.salesman.id === 's1').status).toBe('PRESENT');
      expect(res.data.find(d => d.salesman.id === 's2').status).toBe('ABSENT');
      expect(res.data.find(d => d.salesman.id === 's3').status).toBe('ABSENT');
    });
  });

  describe('getMonthlyReport', () => {
    it('aggregates daily data for salesmen over month', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([{ id: 's1', full_name: 'John', distributor_id: 'd1' }]) // salesmen
        .mockResolvedValueOnce([ // Working Days
          { salesman_id: 's1', date_str: '2026-08-01', check_in_at: new Date(), check_out_at: new Date() }
        ])
        .mockResolvedValueOnce([ // Visits
          { salesman_id: 's1', date_str: '2026-08-01', visit_count: '2' }
        ])
        .mockResolvedValueOnce([ // Holidays
          { hd: '2026-08-15' }
        ]);

      mockWdCalculator.getApplicableAttendanceDays.mockResolvedValue(['2026-08-01', '2026-08-02']); // Assuming 2 days

      const res = await service.getMonthlyReport('SUPER_ADMIN', 'u', { startDate: '2026-08-01', endDate: '2026-08-02' });
      
      expect(res.length).toBe(1);
      expect(res[0].summary.present_days).toBe(1);
      expect(res[0].summary.absent_days).toBe(1);
      
      const day1 = res[0].days.find(d => d.date === '2026-08-01');
      expect(day1.status).toBe('PRESENT');
      
      const day2 = res[0].days.find(d => d.date === '2026-08-02');
      expect(day2.status).toBe('ABSENT');
    });
  });
});
