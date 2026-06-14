import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { BatchLocationDto } from './dto/batch-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @Roles('SALESMAN')
  async uploadLocation(@Request() req, @Body() createLocationDto: CreateLocationDto) {
    return this.locationService.uploadLocation(req.user.userId, createLocationDto);
  }

  @Post('batch')
  @Roles('SALESMAN')
  async batchUploadLocations(@Request() req, @Body() batchLocationDto: BatchLocationDto) {
    return this.locationService.batchUploadLocations(req.user.userId, batchLocationDto);
  }

  @Get('salesmen/:id/live')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async getLiveLocation(@Request() req, @Param('id') salesmanId: string) {
    return this.locationService.getLiveLocation(req.user.userId, req.user.role, salesmanId);
  }

  @Get('salesmen/:id/history')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  async getLocationHistory(@Request() req, @Param('id') salesmanId: string) {
    return this.locationService.getLocationHistory(req.user.userId, req.user.role, salesmanId);
  }
}
