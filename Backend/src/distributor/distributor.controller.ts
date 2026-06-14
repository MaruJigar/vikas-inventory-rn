import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { DistributorService } from './distributor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { UpdateDistributorProfileDto } from './dto/update-distributor-profile.dto';

@Controller('distributors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DistributorController {
  constructor(private distributorService: DistributorService) {}

  @Roles('DISTRIBUTOR_ADMIN')
  @Get('profile')
  getProfile(@Request() req) {
    return this.distributorService.getProfile(req.user.userId);
  }

  @Roles('DISTRIBUTOR_ADMIN')
  @Put('profile')
  updateProfile(@Request() req, @Body() dto: UpdateDistributorProfileDto) {
    return this.distributorService.updateProfile(req.user.userId, dto);
  }
}
