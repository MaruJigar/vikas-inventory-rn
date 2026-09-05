import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('analytics/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Attendance Analytics')
@ApiBearerAuth('bearer')
export class AttendanceAnalyticsController {
  constructor(private readonly attendanceAnalyticsService: AttendanceAnalyticsService) {}

  @Get('summary')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Attendance Summary' })
  getSummary(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceAnalyticsService.getSummary(req.user.role, req.user.userId, query);
  }

  @Get('daily')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Daily Attendance Report' })
  getDailyReport(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceAnalyticsService.getDailyReport(req.user.role, req.user.userId, query);
  }

  @Get('monthly')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Monthly Attendance Report' })
  getMonthlyReport(@Request() req, @Query() query: AttendanceQueryDto) {
    return this.attendanceAnalyticsService.getMonthlyReport(req.user.role, req.user.userId, query);
  }

  @Get('salesman/:salesmanId')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Salesman Detailed Report' })
  getSalesmanDetailReport(
    @Request() req,
    @Param('salesmanId') salesmanId: string,
    @Query() query: AttendanceQueryDto,
  ) {
    return this.attendanceAnalyticsService.getSalesmanDetailReport(req.user.role, req.user.userId, salesmanId, query);
  }

  @Get('salesman/:salesmanId/day/:date')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Salesman Daily Activity Timeline' })
  getDailyActivityTimeline(
    @Request() req,
    @Param('salesmanId') salesmanId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceAnalyticsService.getDailyActivityTimeline(req.user.role, req.user.userId, salesmanId, date);
  }
}
