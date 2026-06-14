import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { VisitService } from './visit.service';
import { StartVisitDto } from './dto/start-visit.dto';
import { EndVisitDto } from './dto/end-visit.dto';
import { NoOrderVisitDto } from './dto/no-order-visit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post('start')
  @Roles('SALESMAN')
  startVisit(@Request() req, @Body() dto: StartVisitDto) {
    return this.visitService.startVisit(req.user.userId, dto);
  }

  @Post('end')
  @Roles('SALESMAN')
  endVisit(@Request() req, @Body() dto: EndVisitDto) {
    return this.visitService.endVisit(req.user.userId, dto);
  }

  @Post('no-order')
  @Roles('SALESMAN')
  noOrderVisit(@Request() req, @Body() dto: NoOrderVisitDto) {
    return this.visitService.noOrderVisit(req.user.userId, dto);
  }

  @Get()
  getVisits(@Request() req) {
    return this.visitService.getVisits(req.user.userId, req.user.role);
  }

  @Get(':id')
  getVisitById(@Request() req, @Param('id') id: string) {
    return this.visitService.getVisitById(req.user.userId, req.user.role, id);
  }
}
