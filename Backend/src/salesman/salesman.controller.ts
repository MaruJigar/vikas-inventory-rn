import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SalesmanService } from './salesman.service';
import { RegisterSalesmanDto } from './dto/register-salesman.dto';
import { CreateSalesmanAdminDto } from './dto/create-salesman-admin.dto';
import { UpdateSalesmanDto } from './dto/update-salesman.dto';
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
import { Salesman } from './salesman.entity';

@Controller('salesmen')
@ApiTags('Salesman')
export class SalesmanController {
  constructor(private readonly salesmanService: SalesmanService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  register(@Body() dto: RegisterSalesmanDto) {
    return this.salesmanService.register(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create Salesman (Admin)' })
  @ApiBearerAuth('bearer')
  createSalesmanAdmin(@Body() dto: CreateSalesmanAdminDto, @Request() req) {
    return this.salesmanService.createSalesmanAdmin(
      dto,
      req.user.role,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get Salesmen' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Salesman)
  getSalesmen(@Request() req, @Query() query: ListQueryDto) {
    return this.salesmanService.getSalesmen(
      req.user.role,
      req.user.userId,
      query,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get(':id')
  @ApiOperation({ summary: 'Get Salesman By Id' })
  @ApiBearerAuth('bearer')
  getSalesmanById(@Param('id') id: string, @Request() req) {
    return this.salesmanService.getSalesmanById(
      id,
      req.user.role,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Put(':id')
  @ApiOperation({ summary: 'Update Salesman' })
  @ApiBearerAuth('bearer')
  updateSalesman(
    @Param('id') id: string,
    @Body() dto: UpdateSalesmanDto,
    @Request() req,
  ) {
    return this.salesmanService.updateSalesman(
      id,
      dto,
      req.user.role,
      req.user.userId,
    );
  }
}
