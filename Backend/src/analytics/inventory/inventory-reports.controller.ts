import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../role-permission/roles.decorator';
import { InventoryReportsService } from './inventory-reports.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../role-permission/roles.guard';

@ApiTags('Analytics - Inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics/inventory/reports')
export class InventoryReportsController {
  constructor(private readonly inventoryReportsService: InventoryReportsService) {}

  @Get('inventory-valuation')
  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get Inventory Valuation Report' })
  @ApiBearerAuth('bearer')
  async getInventoryValuation(@Request() req) {
    return this.inventoryReportsService.getInventoryValuation(
      req.user.role,
      req.user.userId,
    );
  }
}
