import { Test, TestingModule } from '@nestjs/testing';
import { WorkingDayCalculatorService } from './working-day-calculator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Distributor } from '../distributor/distributor.entity';
import { Holiday } from './holiday.entity';
import { BadRequestException } from '@nestjs/common';

const mockDistributorRepo = {
  findOne: jest.fn(),
};

const mockHolidayRepo = {
  createQueryBuilder: jest.fn(),
};

describe('WorkingDayCalculatorService', () => {
  let service: WorkingDayCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkingDayCalculatorService,
        {
          provide: getRepositoryToken(Distributor),
          useValue: mockDistributorRepo,
        },
        {
          provide: getRepositoryToken(Holiday),
          useValue: mockHolidayRepo,
        },
      ],
    }).compile();

    service = module.get<WorkingDayCalculatorService>(WorkingDayCalculatorService);
    jest.clearAllMocks();
  });

  const setupMocks = (workingDays: number[], holidays: string[]) => {
    mockDistributorRepo.findOne.mockResolvedValue({
      id: 'dist-1',
      working_days: workingDays,
    });
    mockHolidayRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(holidays.map(h => ({ holiday_date: h }))),
    });
  };

  it('CASE 1: Monday should be reportable', async () => {
    // Aug 3 2026 is Monday
    setupMocks([1, 2, 3, 4, 5, 6], []); 
    const result = await service.getApplicableAttendanceDays('dist-1', '2026-08-03', '2026-08-03');
    expect(result).toEqual(['2026-08-03']); 
  });

  it('CASE 2: Sunday should be reportable even if working_days config is default (excluding 0)', async () => {
    // Aug 2 2026 is Sunday
    setupMocks([1, 2, 3, 4, 5, 6], []); 
    const result = await service.getApplicableAttendanceDays('dist-1', '2026-08-02', '2026-08-02');
    expect(result).toEqual(['2026-08-02']); // Applicable because EVERY day is applicable
  });

  it('CASE 3: Monday is configured as holiday, but it should still be applicable (returned in applicable days)', async () => {
    // Aug 3 2026 is Monday
    setupMocks([1, 2, 3, 4, 5, 6], ['2026-08-03']); 
    
    const result = await service.getApplicableAttendanceDays('dist-1', '2026-08-03', '2026-08-03');
    
    expect(result).toEqual(['2026-08-03']); // Still applicable!
  });

  it('CASE 4: Correct Indian calendar date / Crosses UTC/IST boundary', async () => {
    setupMocks([1, 2, 3, 4, 5, 6], []); 
    const result = await service.getApplicableAttendanceDays('dist-1', '2026-08-31', '2026-09-01');
    expect(result).toEqual(['2026-08-31', '2026-09-01']);
  });

  it('CASE 5: Custom date range inclusive start/end behavior', async () => {
    // Aug 2 2026 (Sun) to Aug 8 2026 (Sat)
    setupMocks([1, 2, 3, 4, 5, 6], []); 
    
    const result = await service.getApplicableAttendanceDays('dist-1', '2026-08-02', '2026-08-08');
    
    // Should INCLUDE Sunday (Aug 2)
    expect(result).toEqual([
      '2026-08-02', // Sun
      '2026-08-03', // Mon
      '2026-08-04', // Tue
      '2026-08-05', // Wed
      '2026-08-06', // Thu
      '2026-08-07', // Fri
      '2026-08-08', // Sat
    ]);
  });

  it('CASE 6: Validation on format', async () => {
    setupMocks([1, 2, 3, 4, 5, 6], []); 
    await expect(service.getApplicableAttendanceDays('dist-1', '2026-8-1', '2026-8-2'))
      .rejects.toThrow(BadRequestException);
  });
});
