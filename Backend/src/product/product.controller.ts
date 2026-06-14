import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  createProduct(@Request() req, @Body() dto: CreateProductDto) {
    return this.productService.createProduct(req.user.userId, dto);
  }

  @Get()
  getProducts() {
    return this.productService.getProducts();
  }

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Put(':id')
  updateProduct(@Request() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(req.user.userId, id, dto);
  }
}
