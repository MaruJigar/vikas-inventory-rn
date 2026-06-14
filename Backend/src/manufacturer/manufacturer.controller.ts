import { Controller, Get, Post, Put, Patch, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateManufacturerAdminDto } from './dto/create-manufacturer-admin.dto';
import { UpdateManufacturerAdminDto } from './dto/update-manufacturer-admin.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Controller('manufacturers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManufacturerController {
  constructor(private manufacturerService: ManufacturerService) {}

  @Roles('MANUFACTURER_ADMIN')
  @Post('profile')
  createProfile(@Request() req, @Body() dto: CreateManufacturerDto) {
    return this.manufacturerService.createProfile(req.user.userId, dto);
  }

  @Roles('MANUFACTURER_ADMIN')
  @Get('profile')
  getProfile(@Request() req) {
    return this.manufacturerService.getProfile(req.user.userId);
  }

  @Roles('MANUFACTURER_ADMIN')
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateManufacturerDto) {
    return this.manufacturerService.updateProfile(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN')
  @Get()
  getManufacturers(@Query() query: ListQueryDto) {
    return this.manufacturerService.getManufacturers(query);
  }

  @Roles('SUPER_ADMIN')
  @Get(':id')
  getManufacturerById(@Param('id') id: string) {
    return this.manufacturerService.getManufacturerById(id);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  createManufacturerAdmin(@Request() req, @Body() dto: CreateManufacturerAdminDto) {
    return this.manufacturerService.createManufacturerAdmin(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  updateManufacturerAdmin(@Request() req, @Param('id') id: string, @Body() dto: UpdateManufacturerAdminDto) {
    return this.manufacturerService.updateManufacturerAdmin(req.user.userId, id, dto);
  }

  @Roles('MANUFACTURER_ADMIN')
  @Post('profile/distributors/:distributorId')
  linkDistributor(@Request() req, @Param('distributorId') distributorId: string) {
    // In a real scenario we'd first find the manufacturer id from the user_id
    // But since the service requires manufacturerId, let's fetch the profile first.
    return this.manufacturerService.getProfile(req.user.userId).then(profile => {
      return this.manufacturerService.linkDistributor(profile.id, distributorId);
    });
  }
}
