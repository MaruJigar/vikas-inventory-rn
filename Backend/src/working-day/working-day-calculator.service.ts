import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distributor } from '../distributor/distributor.entity';
import { Holiday } from './holiday.entity';

@Injectable()
export class WorkingDayCalculatorService {
  constructor(
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    @InjectRepository(Holiday) private holidayRepo: Repository<Holiday>,
  ) {}

  /**
   * Generates a list of applicable attendance days (YYYY-MM-DD in Asia/Kolkata)
   * for a given distributor and date range.
   */
  async getApplicableAttendanceDays(
    distributorId: string,
    startDateStr: string,
    endDateStr: string,
  ): Promise<string[]> {
    const distributor = await this.distRepo.findOne({ where: { id: distributorId } });
    if (!distributor) {
      throw new BadRequestException('Distributor not found');
    }

    // Default to Monday-Saturday if not configured
    const workingDaysConfig = distributor.working_days || [1, 2, 3, 4, 5, 6];

    // Convert boundaries to IST representation
    // To ensure correct bounds, we treat the input strings as YYYY-MM-DD
    // and parse them in the context of Asia/Kolkata.
    
    // Validate inputs
    const startRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!startRegex.test(startDateStr) || !startRegex.test(endDateStr)) {
       throw new BadRequestException('startDate and endDate must be in YYYY-MM-DD format');
    }

    const holidays = await this.holidayRepo
      .createQueryBuilder('holiday')
      .where('holiday.distributor_id = :distId', { distId: distributorId })
      .andWhere('holiday.holiday_date >= :start', { start: startDateStr })
      .andWhere('holiday.holiday_date <= :end', { end: endDateStr })
      .getMany();

    const holidayDateSet = new Set(holidays.map((h) => h.holiday_date));

    // Generate dates
    const applicableDates: string[] = [];
    
    // Create Date objects forced to midnight UTC, we just use them for iteration
    // Since input is YYYY-MM-DD, parsing it as `new Date("YYYY-MM-DDT00:00:00Z")` is safest to iterate
    const current = new Date(`${startDateStr}T00:00:00Z`);
    const end = new Date(`${endDateStr}T00:00:00Z`);

    if (isNaN(current.getTime()) || isNaN(end.getTime())) {
       throw new BadRequestException('Invalid date format');
    }

    if (current > end) {
       throw new BadRequestException('startDate cannot be after endDate');
    }

    while (current <= end) {
      // YYYY-MM-DD of the current iteration date
      const isoString = current.toISOString();
      const dateStr = isoString.split('T')[0];
      
      // getUTCDay() matches the YYYY-MM-DD day because time is 00:00:00Z
      const dayOfWeek = current.getUTCDay();

      // Check if it's a working day and not a holiday
      if (workingDaysConfig.includes(dayOfWeek) && !holidayDateSet.has(dateStr)) {
        applicableDates.push(dateStr);
      }

      // Advance by 1 day (UTC)
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return applicableDates;
  }
}
