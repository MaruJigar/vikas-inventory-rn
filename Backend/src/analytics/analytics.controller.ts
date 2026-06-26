import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Dashboard' })
  @ApiBearerAuth('bearer')
  async getDashboard(@Request() req) {
    return this.analyticsService.getDashboard(req.user.role, req.user.userId);
  }

  @Get('sales')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Sales' })
  @ApiBearerAuth('bearer')
  async getSales(@Request() req) {
    return this.analyticsService.getWorkingDayAnalytics(
      req.user.role,
      req.user.userId,
    ); // Add sales analytics
  }

  @Get('visits')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Visits' })
  @ApiBearerAuth('bearer')
  async getVisits(@Request() req) {
    return this.analyticsService.getVisitsAnalytics(
      req.user.role,
      req.user.userId,
    );
  }

  @Get('orders')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Orders Analytics' })
  @ApiBearerAuth('bearer')
  async getOrders(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOrdersAnalytics(
      req.user.role,
      req.user.userId,
      query,
    );
  }

  @Get('inventory')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get Inventory' })
  @ApiBearerAuth('bearer')
  async getInventory(@Request() req) {
    return this.analyticsService.getInventoryAnalytics(
      req.user.role,
      req.user.userId,
    );
  }

  @Get('backorders')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get Backorders' })
  @ApiBearerAuth('bearer')
  async getBackorders(@Request() req) {
    return this.analyticsService.getBackordersAnalytics(
      req.user.role,
      req.user.userId,
    );
  }

  @Get('fulfillment')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Fulfillment' })
  @ApiBearerAuth('bearer')
  async getFulfillment(@Request() req) {
    return this.analyticsService.getFulfillmentAnalytics(
      req.user.role,
      req.user.userId,
    );
  }

  @Get('approvals')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Approvals' })
  @ApiBearerAuth('bearer')
  async getApprovals(@Request() req) {
    return this.analyticsService.getApprovalsAnalytics(
      req.user.role,
      req.user.userId,
    );
  }
}
