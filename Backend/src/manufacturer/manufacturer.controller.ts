import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { Public } from '../auth/public.decorator';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateManufacturerAdminDto } from './dto/create-manufacturer-admin.dto';
import { UpdateManufacturerAdminDto } from './dto/update-manufacturer-admin.dto';
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
import { Manufacturer } from './manufacturer.entity';

@Controller('manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Manufacturer')
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) { }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Post('profile')
  @ApiOperation({ summary: 'Create Profile' })
  @ApiBearerAuth('bearer')
  createProfile(@Request() req, @Body() dto: CreateManufacturerDto) {
    return this.manufacturerService.createProfile(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Get('profile')
  @ApiOperation({ summary: 'Get Profile' })
  @ApiBearerAuth('bearer')
  getProfile(@Request() req) {
    return this.manufacturerService.getProfile(req.user.userId);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Put('profile')
  @ApiOperation({ summary: 'Update Profile' })
  @ApiBearerAuth('bearer')
  updateProfile(@Request() req, @Body() dto: UpdateManufacturerDto) {
    return this.manufacturerService.updateProfile(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get Manufacturers' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Manufacturer)
  getManufacturers(@Query() query: ListQueryDto) {
    return this.manufacturerService.getManufacturers(query);
  }

  @Public()
  @Get('lookup')
  @ApiOperation({ summary: 'Get Manufacturer Lookup for Signup' })
  getLookup() {
    return this.manufacturerService.getLookup();
  }

  @Roles('SUPER_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get Manufacturer By Id' })
  @ApiBearerAuth('bearer')
  getManufacturerById(@Param('id') id: string) {
    return this.manufacturerService.getManufacturerById(id);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create Manufacturer Admin' })
  @ApiBearerAuth('bearer')
  createManufacturerAdmin(
    @Request() req,
    @Body() dto: CreateManufacturerAdminDto,
  ) {
    return this.manufacturerService.createManufacturerAdmin(
      req.user.userId,
      dto,
    );
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update Manufacturer Admin' })
  @ApiBearerAuth('bearer')
  updateManufacturerAdmin(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateManufacturerAdminDto,
  ) {
    return this.manufacturerService.updateManufacturerAdmin(
      req.user.userId,
      id,
      dto,
    );
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Manufacturer' })
  @ApiBearerAuth('bearer')
  deleteManufacturer(@Request() req, @Param('id') id: string) {
    return this.manufacturerService.deleteManufacturer(req.user.userId, id);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @Post('profile/distributors/:distributorId')
  @ApiOperation({ summary: 'Link Distributor' })
  @ApiBearerAuth('bearer')
  linkDistributor(
    @Request() req,
    @Param('distributorId') distributorId: string,
  ) {
    // In a real scenario we'd first find the manufacturer id from the user_id
    // But since the service requires manufacturerId, let's fetch the profile first.
    return this.manufacturerService
      .getProfile(req.user.userId)
      .then((profile) => {
        return this.manufacturerService.linkDistributor(
          profile.id,
          distributorId,
        );
      });
  }
}
