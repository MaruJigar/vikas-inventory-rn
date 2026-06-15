import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
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

@Controller('product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create Category' })
  @ApiBearerAuth('bearer')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Categories' })
  @ApiBearerAuth('bearer')
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }
}
