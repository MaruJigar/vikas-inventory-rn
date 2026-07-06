import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RegionService } from './region.service';
import { CityQueryDto } from './dto/city-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Region')
export class RegionController {
  constructor(private readonly regionService: RegionService) { }

  @Get('states')
  @ApiOperation({ summary: 'Get all states' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({ description: 'List of all states' })
  async getStates() {
    return this.regionService.findAllStates();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get cities (optionally filtered by state)' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({ description: 'List of cities' })
  async getCities(@Query() query: CityQueryDto) {
    return this.regionService.findCities(query);
  }
}
