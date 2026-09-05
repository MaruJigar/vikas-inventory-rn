import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { UpdateInventorySettingsDto } from './dto/update-inventory-settings.dto';
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
import { DistributorInventory } from './distributor-inventory.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get Inventory' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(DistributorInventory)
  getInventory(@Request() req, @Query() query: ListQueryDto) {
    return this.inventoryService.getInventory(
      req.user.role,
      req.user.userId,
      query,
    );
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post('adjust')
  @ApiOperation({ summary: 'Adjust Manual Stock' })
  @ApiBearerAuth('bearer')
  adjustManualStock(@Body() dto: AdjustInventoryDto, @Request() req) {
    return this.inventoryService.adjustManualStock(
      dto,
      req.user.userId,
      req.user.role,
    );
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get(':id/movements')
  @ApiOperation({ summary: 'Get Movements' })
  @ApiBearerAuth('bearer')
  getMovements(
    @Param('id') id: string,
    @Request() req,
    @Query() query: ListQueryDto,
    @Query('type') type?: string,
  ) {
    const isManufacturer = type === 'manufacturer';
    return this.inventoryService.getMovements(
      id,
      req.user.role,
      req.user.userId,
      query,
      isManufacturer,
    );
  }

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get('settings')
  @ApiOperation({ summary: 'Get Inventory Settings' })
  @ApiBearerAuth('bearer')
  getSettings(@Request() req) {
    return this.inventoryService.getSettings(req.user.userId, req.user.role);
  }

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Patch('settings')
  @ApiOperation({ summary: 'Update Inventory Settings' })
  @ApiBearerAuth('bearer')
  updateSettings(@Body() dto: UpdateInventorySettingsDto, @Request() req) {
    return this.inventoryService.updateSettings(
      dto,
      req.user.userId,
      req.user.role,
    );
  }
}
