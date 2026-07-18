import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
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
import { Product } from './product.entity';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create Product' })
  @ApiBearerAuth('bearer')
  createProduct(@Request() req, @Body() dto: CreateProductDto) {
    return this.productService.createProduct(req.user.userId, req.user.role, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get Products' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Product)
  getProducts(@Request() req, @Query() query: ProductListQueryDto) {
    return this.productService.getProducts(
      req.user.userId,
      req.user.role,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Product by ID' })
  @ApiBearerAuth('bearer')
  getProductById(@Request() req, @Param('id') id: string) {
    return this.productService.getProductById(req.user.userId, req.user.role, id);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update Product' })
  @ApiBearerAuth('bearer')
  updateProduct(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(req.user.userId, req.user.role, id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete Product' })
  @ApiBearerAuth('bearer')
  deleteProduct(@Request() req, @Param('id') id: string) {
    return this.productService.deleteProduct(req.user.userId, req.user.role, id);
  }
}
