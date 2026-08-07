import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { ProductPricingService } from '../product-pricing/product-pricing.service';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { UploadedFile } from '../shop-image/uploaded-file.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Distributor)
    private distributorRepo: Repository<Distributor>,
    @InjectRepository(Manufacturer)
    private manufacturerRepo: Repository<Manufacturer>,
    @InjectRepository(UploadedFile)
    private fileRepo: Repository<UploadedFile>,
    private pricingService: ProductPricingService,
  ) { }

  async createProduct(userId: string, role: string, dto: CreateProductDto) {
    if (role !== 'SUPER_ADMIN') {
      if (dto.product_source === 'MANUFACTURER_CREATED') {
        const profile = await this.manufacturerRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile)
          throw new ForbiddenException(
            'Cannot create product for another manufacturer',
          );
        dto.manufacturer_id = profile.id;
        dto.distributor_id = undefined;
      } else if (dto.product_source === 'DISTRIBUTOR_CREATED') {
        const profile = await this.distributorRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile) {
          throw new ForbiddenException(
            'Cannot create product for another distributor',
          );
        }

        if (profile.is_internal_distributor) {
          if (!dto.manufacturer_id) {
            throw new BadRequestException('Manufacturer ID is required for internal distributor products');
          }
          dto.distributor_id = undefined;
          dto.external_manufacturer_name = undefined;
        } else {
          dto.manufacturer_id = undefined;
          dto.distributor_id = profile.id;
          if (!dto.external_manufacturer_name) {
            throw new BadRequestException(
              'Distributor products must define external manufacturer name',
            );
          }
        }
      }
    }

    const product = this.productRepo.create({
      ...dto,
      created_by_user_id: userId,
    });
    const savedProduct = await this.productRepo.save(product);

    if (savedProduct.product_image_url) {
      const file = await this.fileRepo.findOne({
        where: {
          entity_type: 'PRODUCT',
          entity_id: IsNull(),
          file_url: savedProduct.product_image_url,
        },
      });
      if (file) {
        file.entity_id = savedProduct.id;
        await this.fileRepo.save(file);
      }
    }

    return savedProduct;
  }

  async getProducts(
    userId: string,
    role: string,
    queryDto: ProductListQueryDto,
  ): Promise<PaginatedResponse<Product>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.distributor', 'distributor')
      .leftJoinAndSelect('product.category', 'category');

    // Ownership Enforcement
    if (role === 'MANUFACTURER_ADMIN') {
      const profile = await this.manufacturerRepo.findOne({
        where: { user_id: userId },
      });
      if (!profile)
        throw new ForbiddenException('Manufacturer profile not found');
      // Manufacturer sees their own products + maybe their distributors' products.
      // We'll restrict to their own for strict isolation as defined.
      qb.andWhere('product.manufacturer_id = :mfrId', { mfrId: profile.id });
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const profile = await this.distributorRepo.findOne({
        where: { user_id: userId },
      });
      if (!profile)
        throw new ForbiddenException('Distributor profile not found');

      const manufacturerDistributors = await this.productRepo.manager.find(
        ManufacturerDistributor,
        { where: { distributor_id: profile.id, status: 'APPROVED' } },
      );
      const mfrIds = manufacturerDistributors.map(md => md.manufacturer_id);

      if (mfrIds.length > 0 && !queryDto.own_products_only) {
        qb.andWhere(
          '(product.distributor_id = :distId OR product.manufacturer_id IN (:...mfrIds))',
          { distId: profile.id, mfrIds }
        );
      } else {
        qb.andWhere('product.distributor_id = :distId', { distId: profile.id });
      }
    } else if (role === 'SALESMAN') {
      const profile = await this.productRepo.manager.findOne(Salesman, {
        where: { user_id: userId },
      });
      if (!profile)
        throw new ForbiddenException('Salesman profile not found');

      const manufacturerDistributors = await this.productRepo.manager.find(
        ManufacturerDistributor,
        { where: { distributor_id: profile.distributor_id, status: 'APPROVED' } },
      );
      const mfrIds = manufacturerDistributors.map(md => md.manufacturer_id);

      if (mfrIds.length > 0) {
        qb.andWhere(
          '(product.distributor_id = :distId OR product.manufacturer_id IN (:...mfrIds))',
          { distId: profile.distributor_id, mfrIds }
        );
      } else {
        qb.andWhere('product.distributor_id = :distId', { distId: profile.distributor_id });
      }
    }

    // Active / Inactive Visibility Rules
    if (role !== 'SUPER_ADMIN') {
      qb.andWhere('(product.is_active = true OR product.created_by_user_id = :userId)', { userId });
    }

    // Search
    if (search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.hsn_code ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    // Sorting
    const allowedSortFields = ['created_at', 'updated_at', 'name', 'price', 'hsn_code'];
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

  async getProductById(userId: string, role: string, productId: string) {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.manufacturer', 'manufacturer')
      .leftJoinAndSelect('product.distributor', 'distributor')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :productId', { productId });

    // Active / Inactive Visibility Rules
    if (role !== 'SUPER_ADMIN') {
      qb.andWhere('(product.is_active = true OR product.created_by_user_id = :userId)', { userId });
    }

    const product = await qb.getOne();
    
    if (!product) throw new NotFoundException('Product not found');

    // Ownership Enforcement (Read)
    if (role === 'MANUFACTURER_ADMIN') {
      const profile = await this.manufacturerRepo.findOne({
        where: { user_id: userId },
      });
      if (!profile || profile.id !== product.manufacturer_id) {
        throw new ForbiddenException('Unauthorized to view this product');
      }
    } else if (role === 'DISTRIBUTOR_ADMIN') {
      const profile = await this.distributorRepo.findOne({
        where: { user_id: userId },
      });
      if (!profile) throw new ForbiddenException('Distributor profile not found');

      const mds = await this.productRepo.manager.find(ManufacturerDistributor, {
        where: { distributor_id: profile.id, status: 'APPROVED' },
      });
      const mfrIds = mds.map((md) => md.manufacturer_id);

      const canView = product.distributor_id === profile.id || (product.manufacturer_id && mfrIds.includes(product.manufacturer_id));
      if (!canView) throw new ForbiddenException('Unauthorized to view this product');
    } else if (role === 'SALESMAN') {
      const profile = await this.productRepo.manager.findOne(Salesman, {
        where: { user_id: userId },
      });
      if (!profile) throw new ForbiddenException('Salesman profile not found');

      const mds = await this.productRepo.manager.find(ManufacturerDistributor, {
        where: { distributor_id: profile.distributor_id, status: 'APPROVED' },
      });
      const mfrIds = mds.map((md) => md.manufacturer_id);

      const canView = product.distributor_id === profile.distributor_id || (product.manufacturer_id && mfrIds.includes(product.manufacturer_id));
      if (!canView) throw new ForbiddenException('Unauthorized to view this product');
    }

    return product;
  }

  async updateProduct(
    userId: string,
    role: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Verify ownership
    if (role !== 'SUPER_ADMIN') {
      if (product.product_source === 'MANUFACTURER_CREATED') {
        const profile = await this.manufacturerRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile || profile.id !== product.manufacturer_id)
          throw new ForbiddenException('Unauthorized to modify this product');
      } else if (product.product_source === 'DISTRIBUTOR_CREATED') {
        const profile = await this.distributorRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile || (!profile.is_internal_distributor && profile.id !== product.distributor_id))
          throw new ForbiddenException('Unauthorized to modify this product');
      }
    }

    // Prevent modifying another user's inactive product
    if (role !== 'SUPER_ADMIN' && !product.is_active && product.created_by_user_id !== userId) {
      throw new ForbiddenException('Unauthorized to modify this inactive product');
    }

    // Check if price history needs logging
    const priceChanged =
      (dto.mrp !== undefined && dto.mrp !== product.mrp) ||
      (dto.gst_percent !== undefined &&
        dto.gst_percent !== product.gst_percent) ||
      (dto.distributor_discount_percent !== undefined &&
        dto.distributor_discount_percent !==
        product.distributor_discount_percent) ||
      (dto.special_discount_percent !== undefined &&
        dto.special_discount_percent !== product.special_discount_percent);

    if (priceChanged) {
      await this.pricingService.logPriceChange(
        product.id,
        product,
        dto,
        userId,
        'Price or discount update',
      );
    }

    const oldImageUrl = product.product_image_url;

    Object.assign(product, dto);
    const savedProduct = await this.productRepo.save(product);

    if (
      dto.product_image_url !== undefined &&
      dto.product_image_url !== oldImageUrl &&
      oldImageUrl
    ) {
      const oldFile = await this.fileRepo.findOne({
        where: {
          entity_type: 'PRODUCT',
          entity_id: product.id,
          file_url: oldImageUrl,
        },
      });
      if (oldFile) {
        const cleanupDate = new Date();
        cleanupDate.setDate(cleanupDate.getDate() + 7);
        oldFile.cleanup_after = cleanupDate;
        await this.fileRepo.save(oldFile);
      }
    }

    return savedProduct;
  }

  async deleteProduct(userId: string, role: string, productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Verify ownership
    if (role !== 'SUPER_ADMIN') {
      if (product.product_source === 'MANUFACTURER_CREATED') {
        const profile = await this.manufacturerRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile || profile.id !== product.manufacturer_id)
          throw new ForbiddenException('Unauthorized to delete this product');
      } else if (product.product_source === 'DISTRIBUTOR_CREATED') {
        const profile = await this.distributorRepo.findOne({
          where: { user_id: userId },
        });
        if (!profile || (!profile.is_internal_distributor && profile.id !== product.distributor_id))
          throw new ForbiddenException('Unauthorized to delete this product');
      }
    }

    // Prevent deleting another user's inactive product
    if (role !== 'SUPER_ADMIN' && !product.is_active && product.created_by_user_id !== userId) {
      throw new ForbiddenException('Unauthorized to delete this inactive product');
    }

    await this.productRepo.softDelete(productId);

    if (product.product_image_url) {
      const file = await this.fileRepo.findOne({
        where: {
          entity_type: 'PRODUCT',
          entity_id: product.id,
          file_url: product.product_image_url,
        },
      });
      if (file) {
        const cleanupDate = new Date();
        cleanupDate.setDate(cleanupDate.getDate() + 7);
        file.cleanup_after = cleanupDate;
        await this.fileRepo.save(file);
      }
    }

    return { message: 'Product deleted successfully' };
  }
}
