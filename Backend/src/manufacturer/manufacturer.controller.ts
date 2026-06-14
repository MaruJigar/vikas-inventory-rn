import { Controller, Get, Post, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

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
