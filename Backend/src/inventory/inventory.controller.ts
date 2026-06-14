import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get()
  getInventory(@Request() req, @Query() query: ListQueryDto) {
    return this.inventoryService.getInventory(req.user.role, req.user.userId, query);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post('adjust')
  adjustManualStock(@Body() dto: AdjustInventoryDto, @Request() req) {
    return this.inventoryService.adjustManualStock(dto, req.user.userId, req.user.role);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get(':id/movements')
  getMovements(@Param('id') id: string, @Request() req, @Query() query: ListQueryDto) {
    return this.inventoryService.getMovements(id, req.user.role, req.user.userId, query);
  }
}
