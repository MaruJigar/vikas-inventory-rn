import { Controller, Post, Get, Body, Request, UseGuards } from '@nestjs/common';
import { WorkingDayService } from './working-day.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('working-day')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkingDayController {
  constructor(private readonly wdService: WorkingDayService) {}

  @Roles('SALESMAN')
  @Post('check-in')
  checkIn(@Body() dto: CheckInDto, @Request() req) {
    return this.wdService.checkIn(req.user.userId, dto);
  }

  @Roles('SALESMAN')
  @Post('check-out')
  checkOut(@Body() dto: CheckOutDto, @Request() req) {
    return this.wdService.checkOut(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get('history')
  getHistory(@Request() req) {
    // Similarly, manufacturerDistributors should be passed for Manufacturer Admin
    return this.wdService.getHistory(req.user.userId, req.user.role, []);
  }
}
