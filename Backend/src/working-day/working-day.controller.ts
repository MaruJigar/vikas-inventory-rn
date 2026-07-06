import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkingDayService } from './working-day.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
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

@Controller('working-day')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('WorkingDay')
export class WorkingDayController {
  constructor(private readonly wdService: WorkingDayService) {}

  @Roles('SUPER_ADMIN', 'SALESMAN')
  @Post('check-in')
  @ApiOperation({ summary: 'Check In' })
  @ApiBearerAuth('bearer')
  checkIn(@Body() dto: CheckInDto, @Request() req) {
    return this.wdService.checkIn(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'SALESMAN')
  @Post('check-out')
  @ApiOperation({ summary: 'Check Out' })
  @ApiBearerAuth('bearer')
  checkOut(@Body() dto: CheckOutDto, @Request() req) {
    return this.wdService.checkOut(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get('history')
  @ApiOperation({ summary: 'Get History' })
  @ApiBearerAuth('bearer')
  getHistory(@Request() req) {
    // Similarly, manufacturerDistributors should be passed for Manufacturer Admin
    return this.wdService.getHistory(req.user.userId, req.user.role, []);
  }
}
