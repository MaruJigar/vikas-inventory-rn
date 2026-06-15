import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepo: Repository<ProductCategory>,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async getAllCategories() {
    return this.categoryRepo.find();
  }
}
