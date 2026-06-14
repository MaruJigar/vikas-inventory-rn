import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { SalesmanService } from './salesman.service';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Controller('salesmen')
export class SalesmanController {
  constructor(private readonly salesmanService: SalesmanService) {}

  @Post('register')
  register(@Body() dto: RegisterSalesmanDto) {
    return this.salesmanService.register(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get()
  getSalesmen(@Request() req, @Query() query: ListQueryDto) {
    return this.salesmanService.getSalesmen(req.user.role, req.user.userId, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get(':id')
  getSalesmanById(@Param('id') id: string, @Request() req) {
    return this.salesmanService.getSalesmanById(id, req.user.role, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Put(':id')
  updateSalesman(@Param('id') id: string, @Body() dto: UpdateSalesmanDto, @Request() req) {
    return this.salesmanService.updateSalesman(id, dto, req.user.role, req.user.userId);
  }
}
