import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BackordersService } from './backorders.service';
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
import { Backorder } from '../order/backorder.entity';

@Controller('backorders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Backorders')
export class BackordersController {
  constructor(private readonly backordersService: BackordersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'List Backorders' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Backorder)
  async listBackorders(@Request() req, @Query() query: ListQueryDto) {
    return this.backordersService.listBackorders(
      req.user.role,
      req.user.userId,
      query,
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Get Backorder' })
  @ApiBearerAuth('bearer')
  async getBackorder(@Param('id') id: string, @Request() req) {
    return this.backordersService.getBackorder(
      id,
      req.user.role,
      req.user.userId,
    );
  }

  @Post(':id/allocate')
  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @ApiOperation({ summary: 'Allocate Backorder' })
  @ApiBearerAuth('bearer')
  async allocateBackorder(
    @Param('id') id: string,
    @Body('allocateQuantity') allocateQuantity: number,
    @Request() req,
  ) {
    return this.backordersService.allocateBackorder(
      id,
      allocateQuantity,
      req.user.userId,
    );
  }
}
