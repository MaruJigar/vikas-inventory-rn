import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from './product.entity';
import { ConflictException } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
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

  async getAllCategories(queryDto: ListQueryDto): Promise<PaginatedResponse<ProductCategory>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder = 'DESC' } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.categoryRepo.createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent');

    if (search) {
      qb.andWhere('category.name ILIKE :search', { search: `%${search}%` });
    }

    const allowedSortFields = ['created_at', 'updated_at', 'name'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`category.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('category.created_at', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parent_id },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Check if products exist for this category
    const productsCount = await this.productRepo.count({
      where: { category_id: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        'Cannot delete category because products are assigned to it.',
      );
    }

    await this.categoryRepo.softDelete(id);
    return { success: true, message: 'Category deleted successfully' };
  }
}
