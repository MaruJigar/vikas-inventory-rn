import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductPricingService } from './product-pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';

@Controller('product-pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductPricingController {
  constructor(private pricingService: ProductPricingService) {}

  @Get('products/:id/history')
  getHistory(@Param('id') id: string) {
    return this.pricingService.getHistory(id);
  }
}
