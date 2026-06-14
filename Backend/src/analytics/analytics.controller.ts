import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getDashboard(@Request() req) {
    return this.analyticsService.getDashboard(req.user.role, req.user.userId);
  }

  @Get('sales')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getSales(@Request() req) {
    return this.analyticsService.getWorkingDayAnalytics(req.user.role, req.user.userId); // Add sales analytics
  }

  @Get('visits')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getVisits(@Request() req) {
    return this.analyticsService.getVisitsAnalytics(req.user.role, req.user.userId);
  }

  @Get('orders')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getOrders(@Request() req) {
    return this.analyticsService.getOrdersAnalytics(req.user.role, req.user.userId);
  }

  @Get('inventory')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async getInventory(@Request() req) {
    return this.analyticsService.getInventoryAnalytics(req.user.role, req.user.userId);
  }

  @Get('backorders')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async getBackorders(@Request() req) {
    return this.analyticsService.getBackordersAnalytics(req.user.role, req.user.userId);
  }

  @Get('fulfillment')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getFulfillment(@Request() req) {
    return this.analyticsService.getFulfillmentAnalytics(req.user.role, req.user.userId);
  }

  @Get('approvals')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getApprovals(@Request() req) {
    return this.analyticsService.getApprovalsAnalytics(req.user.role, req.user.userId);
  }
}
