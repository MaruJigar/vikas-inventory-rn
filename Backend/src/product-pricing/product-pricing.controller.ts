import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductPricingService } from './product-pricing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
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

@Controller('product-pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ProductPricing')
export class ProductPricingController {
  constructor(private pricingService: ProductPricingService) {}

  @Get('products/:id/history')
  @ApiOperation({ summary: 'Get History' })
  @ApiBearerAuth('bearer')
  getHistory(@Param('id') id: string) {
    return this.pricingService.getHistory(id);
  }
}
