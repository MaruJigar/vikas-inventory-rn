import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductPricingService } from '../product-pricing/product-pricing.service';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';

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

  async getProducts() {
    return this.productRepo.find();
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
