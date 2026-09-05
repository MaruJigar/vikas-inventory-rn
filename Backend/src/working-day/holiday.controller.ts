import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Holiday } from './holiday.entity';

@Controller('distributors/:distributorId/holidays')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Holidays')
@ApiBearerAuth('bearer')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Create holiday' })
  create(
    @Request() req,
    @Param('distributorId') distributorId: string,
    @Body() createHolidayDto: CreateHolidayDto,
  ) {
    return this.holidayService.create(req.user.userId, req.user.role, distributorId, createHolidayDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'List holidays' })
  @ApiPaginatedResponse(Holiday)
  findAll(
    @Request() req,
    @Param('distributorId') distributorId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.holidayService.findAll(req.user.userId, req.user.role, distributorId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get holiday by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.holidayService.findOne(req.user.userId, req.user.role, id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Update holiday' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateHolidayDto: UpdateHolidayDto,
  ) {
    return this.holidayService.update(req.user.userId, req.user.role, id, updateHolidayDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Delete holiday' })
  remove(@Request() req, @Param('id') id: string) {
    return this.holidayService.remove(req.user.userId, req.user.role, id);
  }
}
