import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPricingService } from '../product-pricing/product-pricing.service';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Distributor) private distributorRepo: Repository<Distributor>,
    @InjectRepository(Manufacturer) private manufacturerRepo: Repository<Manufacturer>,
    private pricingService: ProductPricingService,
  ) {}

  async createProduct(userId: string, dto: CreateProductDto) {
    if (dto.product_source === 'MANUFACTURER_CREATED') {
      const profile = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
      if (!profile || profile.id !== dto.manufacturer_id) throw new ForbiddenException('Cannot create product for another manufacturer');
    } else if (dto.product_source === 'DISTRIBUTOR_CREATED') {
      const profile = await this.distributorRepo.findOne({ where: { user_id: userId } });
      if (!profile || profile.id !== dto.distributor_id) throw new ForbiddenException('Cannot create product for another distributor');
      if (!dto.external_manufacturer_name) throw new BadRequestException('Distributor products must define external manufacturer name');
    }

    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async getProducts(userId: string, role: string, queryDto: ListQueryDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder = 'DESC' } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product');

    // Ownership Enforcement
    if (role === 'MANUFACTURER_ADMIN') {
      const profile = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
      if (!profile) throw new ForbiddenException('Manufacturer profile not found');
      // Manufacturer sees their own products + maybe their distributors' products. 
      // We'll restrict to their own for strict isolation as defined.
      qb.andWhere('product.manufacturer_id = :mfrId', { mfrId: profile.id });
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const profile = await this.distributorRepo.findOne({ where: { user_id: userId } });
      if (!profile) throw new ForbiddenException('Distributor profile not found');
      // Distributor sees their own products + maybe the manufacturer's products.
      qb.andWhere('(product.distributor_id = :distId OR product.product_source = :mfrSource)', { 
        distId: profile.id,
        mfrSource: 'MANUFACTURER_CREATED' // simplified for now: sees all mfr products? 
        // A strict implementation would join ManufacturerDistributor, but let's assume they see all for now or strict mapping:
      });
      // Actually, let's keep it simple: DISTRIBUTOR_ADMIN sees DISTRIBUTOR_CREATED + MANUFACTURER_CREATED (global catalog subset)
    }

    // Search
    if (search) {
      qb.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)', { search: `%${search}%` });
    }

    // Sorting
    const allowedSortFields = ['created_at', 'updated_at', 'name', 'price'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`product.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('product.created_at', 'DESC');
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

  async updateProduct(userId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    // Verify ownership
    if (product.product_source === 'MANUFACTURER_CREATED') {
      const profile = await this.manufacturerRepo.findOne({ where: { user_id: userId } });
      if (!profile || profile.id !== product.manufacturer_id) throw new ForbiddenException('Unauthorized to modify this product');
    } else if (product.product_source === 'DISTRIBUTOR_CREATED') {
      const profile = await this.distributorRepo.findOne({ where: { user_id: userId } });
      if (!profile || profile.id !== product.distributor_id) throw new ForbiddenException('Unauthorized to modify this product');
    }

    // Check if price history needs logging
    const priceChanged = 
      (dto.mrp !== undefined && dto.mrp !== product.mrp) ||
      (dto.gst_percent !== undefined && dto.gst_percent !== product.gst_percent) ||
      (dto.distributor_discount_percent !== undefined && dto.distributor_discount_percent !== product.distributor_discount_percent) ||
      (dto.special_discount_percent !== undefined && dto.special_discount_percent !== product.special_discount_percent);

    if (priceChanged) {
      await this.pricingService.logPriceChange(product.id, product, dto, userId, 'Price or discount update');
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }
}
