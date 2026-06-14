import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { BackordersService } from './backorders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('backorders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackordersController {
  constructor(private readonly backordersService: BackordersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async listBackorders(@Request() req, @Query() query) {
    return this.backordersService.listBackorders(req.user.role, req.user.userId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async getBackorder(@Param('id') id: string, @Request() req) {
    return this.backordersService.getBackorder(id, req.user.role, req.user.userId);
  }

  @Post(':id/allocate')
  @Roles('DISTRIBUTOR_ADMIN')
  async allocateBackorder(
    @Param('id') id: string,
    @Body('allocateQuantity') allocateQuantity: number,
    @Request() req
  ) {
    return this.backordersService.allocateBackorder(id, allocateQuantity, req.user.userId);
  }
}
