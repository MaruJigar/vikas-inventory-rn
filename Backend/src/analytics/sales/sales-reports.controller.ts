import { Controller, Get, Request, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../role-permission/roles.decorator';
import { SalesReportsService } from './sales-reports.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../role-permission/roles.guard';

@ApiTags('Analytics - Sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics/sales/reports')
export class SalesReportsController {
  constructor(private readonly salesReportsService: SalesReportsService) {}

  @Get('sales-summary')
  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get Sales Summary Report' })
  @ApiBearerAuth('bearer')
  async getSalesSummary(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.salesReportsService.getSalesSummary(
      req.user.role,
      req.user.userId,
      query,
    );
  }
}
