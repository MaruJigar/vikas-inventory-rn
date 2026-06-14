import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CheckDuplicateDto } from './dto/check-duplicate.dto';
import { ShopDuplicateDetectionService } from '../shop-duplicate-detection/shop-duplicate-detection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly duplicateDetectionService: ShopDuplicateDetectionService
  ) {}

  @Roles('DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Post('check-duplicate')
  async checkDuplicate(@Body() dto: CheckDuplicateDto) {
    let distributorId: any = null;
    return this.duplicateDetectionService.checkDuplicate(distributorId, dto.phone || '', dto.name, dto.latitude, dto.longitude);
  }

  @Roles('DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Post()
  createShop(@Body() dto: CreateShopDto, @Request() req) {
    return this.shopService.createShop(dto, req.user.userId, req.user.role);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get()
  getShops(@Request() req) {
    return this.shopService.getShops(req.user.userId, req.user.role, []);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Get(':id')
  getShopById(@Param('id') id: string, @Request() req) {
    return this.shopService.getShopById(id, req.user.userId, req.user.role, []);
  }

  @Roles('SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @Patch(':id')
  updateShop(@Param('id') id: string, @Body() dto: UpdateShopDto, @Request() req) {
    return this.shopService.updateShop(id, dto, req.user.userId, req.user.role, []);
  }
}
