import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WorkingDayCalculatorService } from '../working-day/working-day-calculator.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { applyOwnership } from './shared/utils/report-builder.util';

@Injectable()
export class AttendanceAnalyticsService {
  constructor(
    private dataSource: DataSource,
    private wdCalculator: WorkingDayCalculatorService,
  ) {}

  private buildDateRange(query: AttendanceQueryDto): { start: string; end: string } {
    if (query.date) return { start: query.date, end: query.date };
    if (query.startDate && query.endDate) return { start: query.startDate, end: query.endDate };
    if (query.month && query.year) {
      const start = `${query.year}-${query.month.padStart(2, '0')}-01`;
      const date = new Date(Number(query.year), Number(query.month), 0);
      const end = `${query.year}-${query.month.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      return { start, end };
    }
    const today = new Date();
    // Default to today in IST
    const ist = new Date(today.getTime() + (5.5 * 60 * 60 * 1000));
    const todayStr = ist.toISOString().split('T')[0];
    return { start: todayStr, end: todayStr };
  }

  private async getSalesmenQuery(userRole: string, userId: string, filterDistributorId?: string, filterSalesmanId?: string) {
    let q = `SELECT s.id, s.full_name, s.distributor_id FROM salesmen s WHERE s.approval_status = 'APPROVED'`;
    const params: any[] = [];
    let pIdx = 1;

    if (filterSalesmanId) {
      q += ` AND s.id = $${pIdx++}`;
      params.push(filterSalesmanId);
    }
    if (filterDistributorId) {
      q += ` AND s.distributor_id = $${pIdx++}`;
      params.push(filterDistributorId);
    }

    if (userRole === 'DISTRIBUTOR_ADMIN') {
      const dists = await this.dataSource.query(`SELECT id FROM distributors WHERE user_id = $1`, [userId]);
      if (dists.length > 0) {
        q += ` AND s.distributor_id = $${pIdx++}`;
        params.push(dists[0].id);
      } else {
        q += ` AND 1=0`;
      }
    } else if (userRole === 'SALESMAN') {
      const sls = await this.dataSource.query(`SELECT id FROM salesmen WHERE user_id = $1`, [userId]);
      if (sls.length > 0) {
        q += ` AND s.id = $${pIdx++}`;
        params.push(sls[0].id);
      } else {
        q += ` AND 1=0`;
      }
    } else if (userRole === 'MANUFACTURER_ADMIN') {
      const mfrs = await this.dataSource.query(`SELECT id FROM manufacturers WHERE user_id = $1`, [userId]);
      if (mfrs.length > 0) {
        // Just as an example, if there's manufacturer to distributor linkage
        q += ` AND s.distributor_id IN (SELECT distributor_id FROM manufacturer_distributors WHERE manufacturer_id = $${pIdx++})`;
        params.push(mfrs[0].id);
      } else {
         q += ` AND 1=0`;
      }
    }

    const salesmen = await this.dataSource.query(q, params);
    return salesmen;
  }

  async getSummary(userRole: string, userId: string, query: AttendanceQueryDto) {
    const { start, end } = this.buildDateRange(query);
    const salesmen = await this.getSalesmenQuery(userRole, userId, query.distributor_id, query.salesman_id);
    
    if (salesmen.length === 0) {
      return { start_date: start, end_date: end, applicable_days: 0, present_days: 0, absent_days: 0, active: 0, completed: 0, total_visits: 0 };
    }

    let totalApplicable = 0;
    let totalPresent = 0;
    let totalActive = 0;
    let totalCompleted = 0;

    for (const salesman of salesmen) {
      const applicableDays = await this.wdCalculator.getApplicableAttendanceDays(salesman.distributor_id, start, end);
      totalApplicable += applicableDays.length;

      const records = await this.dataSource.query(`
        SELECT 
          TO_CHAR((check_in_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') as check_in_date,
          status,
          check_out_at
        FROM working_days
        WHERE salesman_id = $1
        AND check_in_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
        AND check_in_at < ($3::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
      `, [salesman.id, start, end]);

      const attendedSet = new Set(records.map(r => r.check_in_date));
      
      for (const d of applicableDays) {
         if (attendedSet.has(d)) {
            totalPresent++;
         }
      }
      for (const r of records) {
        if (r.check_out_at == null) totalActive++;
        else totalCompleted++;
      }
    }

    const totalAbsent = totalApplicable - totalPresent;

    const sIds = salesmen.map(s => s.id);
    const visits = await this.dataSource.query(`
      SELECT COUNT(id) as total_visits
      FROM shop_visits
      WHERE salesman_id = ANY($1::uuid[])
      AND started_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND started_at < ($3::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
    `, [sIds, start, end]);

    return {
      start_date: start,
      end_date: end,
      applicable_days: totalApplicable,
      present_days: totalPresent,
      absent_days: totalAbsent,
      active: totalActive,
      completed: totalCompleted,
      total_visits: Number(visits[0].total_visits)
    };
  }

  async getDailyReport(userRole: string, userId: string, query: AttendanceQueryDto) {
    const { start: date } = this.buildDateRange(query);
    const salesmen = await this.getSalesmenQuery(userRole, userId, query.distributor_id, query.salesman_id);

    const sIds = salesmen.map(s => s.id);
    if (sIds.length === 0) return { date, summary: {}, data: [], meta: {} };

    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const workingDays = await this.dataSource.query(`
      SELECT 
        w.id as wd_id, w.salesman_id, w.status, w.check_in_at, w.check_out_at,
        ST_X(w.check_in_location::geometry) as check_in_lon, ST_Y(w.check_in_location::geometry) as check_in_lat,
        ST_X(w.check_out_location::geometry) as check_out_lon, ST_Y(w.check_out_location::geometry) as check_out_lat,
        EXTRACT(EPOCH FROM (COALESCE(w.check_out_at, NOW()) - w.check_in_at)) / 60 as duration_minutes
      FROM working_days w
      WHERE w.salesman_id = ANY($1::uuid[])
      AND w.check_in_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND w.check_in_at < ($2::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
    `, [sIds, date]);

    const visits = await this.dataSource.query(`
      SELECT salesman_id, COUNT(id) as visit_count
      FROM shop_visits
      WHERE salesman_id = ANY($1::uuid[])
      AND started_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND started_at < ($2::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
      GROUP BY salesman_id
    `, [sIds, date]);

    let present = 0;
    let absent = 0;
    let active = 0;
    let completed = 0;
    let totalVisits = 0;

    const salesmanData: any[] = [];

    for (const salesman of salesmen) {
      const applicableDays = await this.wdCalculator.getApplicableAttendanceDays(salesman.distributor_id, date, date);
      const isApplicable = applicableDays.includes(date);
      const wd = workingDays.find(w => w.salesman_id === salesman.id);
      const visit = visits.find(v => v.salesman_id === salesman.id);
      const visitCount = visit ? Number(visit.visit_count) : 0;
      totalVisits += visitCount;

      let attnStatus: string | null = null;
      if (wd) {
        attnStatus = 'PRESENT';
        present++;
        if (wd.check_out_at == null) {
           active++;
           wd.status = 'ACTIVE';
        }
        else {
           completed++;
           wd.status = 'COMPLETED';
        }
      } else {
        attnStatus = 'ABSENT';
        absent++;
      }
      
      salesmanData.push({
        salesman: { id: salesman.id, full_name: salesman.full_name },
        attendance: wd ? {
          status: wd.status,
          check_in_at: wd.check_in_at,
          check_out_at: wd.check_out_at,
          duration_minutes: Math.round(wd.duration_minutes),
          check_in_location: wd.check_in_lat ? { latitude: wd.check_in_lat, longitude: wd.check_in_lon } : null,
          check_out_location: wd.check_out_lat ? { latitude: wd.check_out_lat, longitude: wd.check_out_lon } : null
        } : null,
        status: attnStatus,
        visits: { count: visitCount }
      });
    }

    if (query.search) {
       // simple client side filter if search provided
       const searchLower = query.search.toLowerCase();
       // mutate salesmanData...
    }

    const paginatedData = salesmanData.slice(offset, offset + limit);

    return {
      date,
      summary: {
        salesmen: salesmen.length,
        present,
        absent,
        active,
        completed,
        total_visits: totalVisits
      },
      data: paginatedData,
      meta: {
        page, limit, total: salesmanData.length, totalPages: Math.ceil(salesmanData.length / limit),
        hasNextPage: offset + limit < salesmanData.length,
        hasPreviousPage: page > 1
      }
    };
  }

  async getMonthlyReport(userRole: string, userId: string, query: AttendanceQueryDto) {
    const { start, end } = this.buildDateRange(query);
    const salesmen = await this.getSalesmenQuery(userRole, userId, query.distributor_id, query.salesman_id);
    const sIds = salesmen.map(s => s.id);
    if (sIds.length === 0) return [];

    const workingDays = await this.dataSource.query(`
      SELECT 
        w.salesman_id,
        TO_CHAR((w.check_in_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') as date_str,
        w.check_in_at, w.check_out_at, w.status
      FROM working_days w
      WHERE w.salesman_id = ANY($1::uuid[])
      AND w.check_in_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND w.check_in_at < ($3::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
    `, [sIds, start, end]);

    const visits = await this.dataSource.query(`
      SELECT 
        salesman_id,
        TO_CHAR((started_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'), 'YYYY-MM-DD') as date_str,
        COUNT(id) as visit_count
      FROM shop_visits
      WHERE salesman_id = ANY($1::uuid[])
      AND started_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND started_at < ($3::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
      GROUP BY salesman_id, date_str
    `, [sIds, start, end]);

    // Generate day list
    const daysArr: string[] = [];
    const curr = new Date(`${start}T00:00:00Z`);
    const ed = new Date(`${end}T00:00:00Z`);
    while (curr <= ed) {
      daysArr.push(curr.toISOString().split('T')[0]);
      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    const res: any[] = [];
    for (const salesman of salesmen) {
      const applicableDays = await this.wdCalculator.getApplicableAttendanceDays(salesman.distributor_id, start, end);
      const appSet = new Set(applicableDays);
      
      const holidays = await this.dataSource.query(`SELECT holiday_date::text as hd FROM holidays WHERE distributor_id = $1`, [salesman.distributor_id]);
      const holSet = new Set(holidays.map((h: any) => h.hd));

      let present = 0, absent = 0, totalV = 0;
      const days: any[] = [];

      for (const d of daysArr) {
         const wd = workingDays.find(w => w.salesman_id === salesman.id && w.date_str === d);
         const v = visits.find(v => v.salesman_id === salesman.id && v.date_str === d);
         const vCount = v ? Number(v.visit_count) : 0;
         totalV += vCount;
         
         const isApplicable = appSet.has(d);
         const isHol = holSet.has(d);

         let status = '';
         if (wd) {
           status = 'PRESENT';
           present++;
         } else if (isHol) {
           status = 'HOLIDAY';
           absent++;
         } else {
           status = 'ABSENT';
           absent++;
         }

         days.push({
           date: d,
           applicable: isApplicable,
           status,
           check_in_at: wd ? wd.check_in_at : null,
           check_out_at: wd ? wd.check_out_at : null,
           visit_count: vCount
         });
      }

      res.push({
        salesman: { id: salesman.id, full_name: salesman.full_name },
        summary: {
           applicable_days: applicableDays.length,
           present_days: present,
           absent_days: absent,
           total_visits: totalV
        },
        days
      });
    }

    return res;
  }

  async getSalesmanDetailReport(userRole: string, userId: string, salesmanId: string, query: AttendanceQueryDto) {
    const monthlyData = await this.getMonthlyReport(userRole, userId, { ...query, salesman_id: salesmanId });
    if (!monthlyData || monthlyData.length === 0) throw new BadRequestException('Salesman not found or unauthorized');
    
    const salesmanData = monthlyData[0];
    const presentCount = salesmanData.summary.present_days;
    const avg = presentCount > 0 ? (salesmanData.summary.total_visits / presentCount).toFixed(2) : 0;
    
    return {
      salesman: salesmanData.salesman,
      summary: {
        ...salesmanData.summary,
        average_visits_per_present_day: Number(avg)
      },
      days: salesmanData.days
    };
  }

  async getDailyActivityTimeline(userRole: string, userId: string, salesmanId: string, date: string) {
    const salesmen = await this.getSalesmenQuery(userRole, userId, undefined, salesmanId);
    if (salesmen.length === 0) throw new BadRequestException('Salesman not found or unauthorized');

    const wd = await this.dataSource.query(`
      SELECT 
        w.id, w.status, w.check_in_at, w.check_out_at,
        ST_X(w.check_in_location::geometry) as check_in_lon, ST_Y(w.check_in_location::geometry) as check_in_lat,
        ST_X(w.check_out_location::geometry) as check_out_lon, ST_Y(w.check_out_location::geometry) as check_out_lat,
        EXTRACT(EPOCH FROM (COALESCE(w.check_out_at, NOW()) - w.check_in_at)) / 60 as duration_minutes
      FROM working_days w
      WHERE w.salesman_id = $1
      AND w.check_in_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND w.check_in_at < ($2::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
      ORDER BY w.check_in_at ASC LIMIT 1
    `, [salesmanId, date]);

    const visits = await this.dataSource.query(`
      SELECT 
        v.id, v.started_at, v.ended_at, v.status,
        s.id as shop_id, s.shop_name,
        ST_X(v.start_location::geometry) as start_lon, ST_Y(v.start_location::geometry) as start_lat,
        ST_X(v.end_location::geometry) as end_lon, ST_Y(v.end_location::geometry) as end_lat
      FROM shop_visits v
      LEFT JOIN shops s ON v.shop_id = s.id
      WHERE v.salesman_id = $1
      AND v.started_at >= ($2::date AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC')
      AND v.started_at < ($2::date + interval '1 day') AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC'
      ORDER BY v.started_at ASC
    `, [salesmanId, date]);

    const wdRecord = wd.length > 0 ? wd[0] : null;

    return {
      date,
      salesman: { id: salesmanId, full_name: salesmen[0].full_name },
      attendance: wdRecord ? {
        status: wdRecord.check_out_at ? 'COMPLETED' : 'ACTIVE',
        check_in_at: wdRecord.check_in_at,
        check_out_at: wdRecord.check_out_at,
        duration_minutes: Math.round(wdRecord.duration_minutes),
        check_in_location: wdRecord.check_in_lat ? { latitude: wdRecord.check_in_lat, longitude: wdRecord.check_in_lon } : null,
        check_out_location: wdRecord.check_out_lat ? { latitude: wdRecord.check_out_lat, longitude: wdRecord.check_out_lon } : null
      } : null,
      visits: visits.map((v: any) => ({
        id: v.id,
        shop: { id: v.shop_id, name: v.shop_name },
        started_at: v.started_at,
        ended_at: v.ended_at,
        status: v.status,
        start_location: v.start_lat ? { latitude: v.start_lat, longitude: v.start_lon } : null,
        end_location: v.end_lat ? { latitude: v.end_lat, longitude: v.end_lon } : null
      }))
    };
  }
}
