import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ProductPricingService } from '../product-pricing/product-pricing.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;

  const mockProductRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDistributorRepo = {
    findOne: jest.fn(),
  };

  const mockManufacturerRepo = {
    findOne: jest.fn(),
  };

  const mockPricingService = {
    logPriceChange: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Distributor), useValue: mockDistributorRepo },
        { provide: getRepositoryToken(Manufacturer), useValue: mockManufacturerRepo },
        { provide: ProductPricingService, useValue: mockPricingService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should throw ForbiddenException if manufacturer tries to create for another manufacturer', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'real-man-id' });
      await expect(
        service.createProduct('user-id', { product_source: 'MANUFACTURER_CREATED', manufacturer_id: 'fake-id', name: 'Test', mrp: 100 })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create product if manufacturer matches profile', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'real-man-id' });
      mockProductRepo.create.mockReturnValue({ id: 'prod1' });
      mockProductRepo.save.mockResolvedValue({ id: 'prod1' });

      const result = await service.createProduct('user-id', { product_source: 'MANUFACTURER_CREATED', manufacturer_id: 'real-man-id', name: 'Test', mrp: 100 });
      expect(result.id).toBe('prod1');
    });

    it('should throw BadRequestException if distributor creates without external_manufacturer_name', async () => {
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'dist-id' });
      await expect(
        service.createProduct('user-id', { product_source: 'DISTRIBUTOR_CREATED', distributor_id: 'dist-id', name: 'Test', mrp: 100 })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateProduct', () => {
    it('should trigger ProductPricingService when mrp changes', async () => {
      mockProductRepo.findOne.mockResolvedValue({ id: 'prod1', product_source: 'MANUFACTURER_CREATED', manufacturer_id: 'man1', mrp: 100 });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'man1' });
      mockProductRepo.save.mockResolvedValue({ id: 'prod1', mrp: 150 });

      await service.updateProduct('user1', 'prod1', { mrp: 150 });
      expect(mockPricingService.logPriceChange).toHaveBeenCalledWith('prod1', expect.anything(), { mrp: 150 }, 'user1', expect.any(String));
    });
  });
});
