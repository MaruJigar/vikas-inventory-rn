import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { VisitService } from './visit.service';
import { StartVisitDto } from './dto/start-visit.dto';
import { EndVisitDto } from './dto/end-visit.dto';
import { NoOrderVisitDto } from './dto/no-order-visit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
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
import { ShopVisit } from '../shop-visit/shop-visit.entity';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post('start')
  @Roles('SUPER_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Start Visit' })
  @ApiBearerAuth('bearer')
  startVisit(@Request() req, @Body() dto: StartVisitDto) {
    return this.visitService.startVisit(req.user.userId, dto);
  }

  @Post('end')
  @Roles('SUPER_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'End Visit' })
  @ApiBearerAuth('bearer')
  endVisit(@Request() req, @Body() dto: EndVisitDto) {
    return this.visitService.endVisit(req.user.userId, dto);
  }

  @Post('no-order')
  @Roles('SUPER_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'No Order Visit' })
  @ApiBearerAuth('bearer')
  noOrderVisit(@Request() req, @Body() dto: NoOrderVisitDto) {
    return this.visitService.noOrderVisit(req.user.userId, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get()
  @ApiOperation({ summary: 'Get Visits' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(ShopVisit)
  getVisits(@Request() req, @Query() query: ListQueryDto) {
    return this.visitService.getVisits(req.user.userId, req.user.role, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Visit By Id' })
  @ApiBearerAuth('bearer')
  getVisitById(@Request() req, @Param('id') id: string) {
    return this.visitService.getVisitById(req.user.userId, req.user.role, id);
  }
}
