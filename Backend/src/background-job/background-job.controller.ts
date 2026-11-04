import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BackgroundJobService } from './background-job.service';
import { BackgroundJobQueryDto } from './dto/background-job-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@ApiTags('Background Jobs')
@Controller('background-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class BackgroundJobController {
  constructor(private readonly backgroundJobService: BackgroundJobService) {}

  @Get('performance')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get Background Job Performance & Metrics Report' })
  async getPerformanceReport(@Query() query: BackgroundJobQueryDto) {
    return this.backgroundJobService.getPerformanceReport(query);
  }
}

