import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get()
  getAllCategories() {
    return this.categoryService.getAllCategories();
  }
}
