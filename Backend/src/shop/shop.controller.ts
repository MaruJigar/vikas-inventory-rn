import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CheckDuplicateDto } from './dto/check-duplicate.dto';
import { ShopDuplicateDetectionService } from '../shop-duplicate-detection/shop-duplicate-detection.service';
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
import { Shop } from './shop.entity';
import { ManufacturerShopDto } from './dto/manufacturer-shop.dto';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly duplicateDetectionService: ShopDuplicateDetectionService,
  ) {}

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Post('check-duplicate')
  @ApiOperation({ summary: 'Check Duplicate' })
  @ApiBearerAuth('bearer')
  async checkDuplicate(@Body() dto: CheckDuplicateDto) {
    const distributorId: any = null;
    return this.duplicateDetectionService.checkDuplicate(
      distributorId,
      dto.phone || '',
      dto.name,
      dto.city_id,
      dto.state_id,
    );
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Post()
  @ApiOperation({ summary: 'Create Shop' })
  @ApiBearerAuth('bearer')
  createShop(@Body() dto: CreateShopDto, @Request() req) {
    return this.shopService.createShop(dto, req.user.userId, req.user.role);
  }

  @Roles('MANUFACTURER_ADMIN')
  @Get('manufacturer')
  @ApiOperation({ summary: 'Get Manufacturer Shops (Restricted View)' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(ManufacturerShopDto)
  getManufacturerShops(@Request() req, @Query() query: ListQueryDto) {
    return this.shopService.getManufacturerShops(req.user.userId, query);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get()
  @ApiOperation({ summary: 'Get Shops' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Shop)
  getShops(@Request() req, @Query() query: ListQueryDto) {
    return this.shopService.getShops(req.user.userId, req.user.role, query);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get(':id')
  @ApiOperation({ summary: 'Get Shop By Id' })
  @ApiBearerAuth('bearer')
  getShopById(@Param('id') id: string, @Request() req) {
    return this.shopService.getShopById(id, req.user.userId, req.user.role);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Patch(':id')
  @ApiOperation({ summary: 'Update Shop' })
  @ApiBearerAuth('bearer')
  updateShop(
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
    @Request() req,
  ) {
    return this.shopService.updateShop(id, dto, req.user.userId, req.user.role);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Shop' })
  @ApiBearerAuth('bearer')
  deleteShop(@Param('id') id: string, @Request() req) {
    return this.shopService.deleteShop(id, req.user.userId, req.user.role);
  }
}
