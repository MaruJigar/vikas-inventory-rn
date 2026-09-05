import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { UpdateDistributorProfileDto } from './dto/update-distributor-profile.dto';
import { CreateDistributorAdminDto } from './dto/create-distributor-admin.dto';
import { UpdateDistributorAdminDto } from './dto/update-distributor-admin.dto';
import { UpdateWorkingScheduleDto } from './dto/update-working-schedule.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
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
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Distributor } from './distributor.entity';

@Controller('distributors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Distributor')
export class DistributorController {
  constructor(private distributorService: DistributorService) {}

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get('profile')
  @ApiOperation({ summary: 'Get Profile' })
  @ApiBearerAuth('bearer')
  getProfile(@Request() req) {
    return this.distributorService.getProfile(req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Put('profile')
  @ApiOperation({ summary: 'Update Profile' })
  @ApiBearerAuth('bearer')
  updateProfile(@Request() req, @Body() dto: UpdateDistributorProfileDto) {
    return this.distributorService.updateProfile(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Put(':id/working-schedule')
  @ApiOperation({ summary: 'Update Working Schedule' })
  @ApiBearerAuth('bearer')
  updateWorkingSchedule(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateWorkingScheduleDto,
  ) {
    return this.distributorService.updateWorkingSchedule(req.user.userId, req.user.role, id, dto);
  }


  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get Distributors' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Distributor)
  getDistributors(@Request() req, @Query() query: ListQueryDto) {
    return this.distributorService.getDistributors(
      req.user.userId,
      req.user.role,
      query,
    );
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get Distributor By Id' })
  @ApiBearerAuth('bearer')
  getDistributorById(@Request() req, @Param('id') id: string) {
    return this.distributorService.getDistributorById(
      req.user.userId,
      req.user.role,
      id,
    );
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create Distributor Admin' })
  @ApiBearerAuth('bearer')
  createDistributorAdmin(
    @Request() req,
    @Body() dto: CreateDistributorAdminDto,
  ) {
    return this.distributorService.createDistributorAdmin(
      req.user.userId,
      req.user.role,
      dto,
    );
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update Distributor Admin' })
  @ApiBearerAuth('bearer')
  updateDistributorAdmin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateDistributorAdminDto,
  ) {
    return this.distributorService.updateDistributorAdmin(
      req.user.userId,
      req.user.role,
      id,
      dto,
    );
  }
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Distributor' })
  @ApiBearerAuth('bearer')
  deleteDistributorAdmin(@Request() req, @Param('id') id: string) {
    return this.distributorService.deleteDistributorAdmin(
      req.user.userId,
      req.user.role,
      id,
    );
  }
}
