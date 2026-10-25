import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { ManufacturerCatalogue } from './entities/manufacturer-catalogue.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import * as fs from 'fs';

// Mock fs and fsPromises
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    existsSync: jest.fn().mockReturnValue(true),
    createReadStream: jest.fn(),
    promises: {
      mkdir: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
      unlink: jest.fn().mockResolvedValue(undefined),
    },
  };
});

describe('CatalogueService', () => {
  let service: CatalogueService;
  let catalogueRepo: any;
  let manufacturerRepo: any;
  let distributorRepo: any;
  let salesmanRepo: any;
  let manufacturerDistributorRepo: any;

  const validPdfBuffer = Buffer.from('%PDF-1.4 Mock PDF content here');
  const invalidBuffer = Buffer.from('NOT A PDF FILE');

  const mockManufacturer = {
    id: 'mfr-uuid-1',
    user_id: 'user-uuid-1',
    company_name: 'Alpha Appliances',
  };

  const mockCatalogue: ManufacturerCatalogue = {
    id: 'cat-uuid-1',
    manufacturer_id: 'mfr-uuid-1',
    original_filename: 'alpha_catalog_2026.pdf',
    stored_filename: 'catalogue_mfr-uuid-1_abc.pdf',
    file_path: 'catalogues/catalogue_mfr-uuid-1_abc.pdf',
    file_url: '/v1/catalogues/mfr-uuid-1/file',
    file_size_bytes: 1024,
    mime_type: 'application/pdf',
    uploaded_by_user_id: 'user-uuid-1',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    catalogueRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => ({ id: 'new-cat-uuid', ...dto, created_at: new Date(), updated_at: new Date() })),
      save: jest.fn(async (entity) => ({ id: entity.id || 'saved-cat-uuid', ...entity })),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(),
    };

    manufacturerRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    distributorRepo = {
      findOne: jest.fn(),
    };

    salesmanRepo = {
      findOne: jest.fn(),
    };

    manufacturerDistributorRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogueService,
        {
          provide: getRepositoryToken(ManufacturerCatalogue),
          useValue: catalogueRepo,
        },
        {
          provide: getRepositoryToken(Manufacturer),
          useValue: manufacturerRepo,
        },
        {
          provide: getRepositoryToken(Distributor),
          useValue: distributorRepo,
        },
        {
          provide: getRepositoryToken(Salesman),
          useValue: salesmanRepo,
        },
        {
          provide: getRepositoryToken(ManufacturerDistributor),
          useValue: manufacturerDistributorRepo,
        },
      ],
    }).compile();

    service = module.get<CatalogueService>(CatalogueService);
  });

  describe('validatePdfFile', () => {
    it('should accept a valid PDF buffer', () => {
      const file = {
        buffer: validPdfBuffer,
        size: validPdfBuffer.length,
        mimetype: 'application/pdf',
        originalname: 'catalogue.pdf',
      } as Express.Multer.File;

      expect(() => service.validatePdfFile(file)).not.toThrow();
    });

    it('should reject a file without %PDF magic bytes', () => {
      const file = {
        buffer: invalidBuffer,
        size: invalidBuffer.length,
        mimetype: 'application/pdf',
        originalname: 'fake.pdf',
      } as Express.Multer.File;

      expect(() => service.validatePdfFile(file)).toThrow(BadRequestException);
    });

    it('should reject a file exceeding max size (25MB)', () => {
      const largeFile = {
        buffer: validPdfBuffer,
        size: 30 * 1024 * 1024,
        mimetype: 'application/pdf',
        originalname: 'huge.pdf',
      } as Express.Multer.File;

      expect(() => service.validatePdfFile(largeFile)).toThrow(BadRequestException);
    });

    it('should reject missing or empty file', () => {
      expect(() => service.validatePdfFile(undefined)).toThrow(BadRequestException);
      expect(() =>
        service.validatePdfFile({ buffer: Buffer.alloc(0), size: 0 } as any),
      ).toThrow(BadRequestException);
    });
  });

  describe('getOwnCatalogue', () => {
    it('should return catalogue response DTO for authorized manufacturer', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(mockCatalogue);

      const result = await service.getOwnCatalogue('user-uuid-1');
      expect(result).not.toBeNull();
      expect(result?.manufacturer_id).toBe('mfr-uuid-1');
      expect(result?.original_filename).toBe('alpha_catalog_2026.pdf');
      expect(result?.download_url).toBe('/v1/catalogues/mfr-uuid-1/file?download=true');
      expect(result?.view_url).toBe('/v1/catalogues/mfr-uuid-1/file');
    });

    it('should return null if manufacturer has no catalogue uploaded', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(null);

      const result = await service.getOwnCatalogue('user-uuid-1');
      expect(result).toBeNull();
    });

    it('should throw ForbiddenException if user has no manufacturer profile', async () => {
      manufacturerRepo.findOne.mockResolvedValue(null);

      await expect(service.getOwnCatalogue('unknown-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('saveOrReplaceCatalogue', () => {
    const validFile = {
      buffer: validPdfBuffer,
      size: validPdfBuffer.length,
      mimetype: 'application/pdf',
      originalname: 'new_catalog.pdf',
    } as Express.Multer.File;

    it('should create initial catalogue record if none exists', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(null);

      const result = await service.saveOrReplaceCatalogue(
        'mfr-uuid-1',
        'user-uuid-1',
        validFile,
      );

      expect(result.original_filename).toBe('new_catalog.pdf');
      expect(catalogueRepo.create).toHaveBeenCalled();
      expect(catalogueRepo.save).toHaveBeenCalled();
    });

    it('should replace existing catalogue and unlink old file after DB save', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue({ ...mockCatalogue });

      const result = await service.saveOrReplaceCatalogue(
        'mfr-uuid-1',
        'user-uuid-1',
        validFile,
      );

      expect(result.original_filename).toBe('new_catalog.pdf');
      expect(catalogueRepo.save).toHaveBeenCalled();
      expect(fs.promises.unlink).toHaveBeenCalled();
    });
  });

  describe('deleteOwnCatalogue', () => {
    it('should delete existing catalogue and unlink physical file', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(mockCatalogue);

      const res = await service.deleteOwnCatalogue('user-uuid-1');
      expect(res.success).toBe(true);
      expect(catalogueRepo.delete).toHaveBeenCalledWith(mockCatalogue.id);
      expect(fs.promises.unlink).toHaveBeenCalled();
    });

    it('should handle non-existent catalogue gracefully', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(null);

      const res = await service.deleteOwnCatalogue('user-uuid-1');
      expect(res.success).toBe(true);
      expect(catalogueRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCatalogueByManufacturerId public access', () => {
    it('should return catalogue metadata for any manufacturer without user authentication', async () => {
      catalogueRepo.findOne.mockResolvedValue(mockCatalogue);

      const result = await service.getCatalogueByManufacturerId('mfr-uuid-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockCatalogue.id);
      expect(result?.manufacturer_id).toBe('mfr-uuid-1');
    });

    it('should return null when catalogue is not found', async () => {
      catalogueRepo.findOne.mockResolvedValue(null);

      const result = await service.getCatalogueByManufacturerId('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getPublicCatalogues', () => {
    it('should return paginated public catalogue metadata', async () => {
      const mockQueryBuilder: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            manufacturer_id: 'mfr-uuid-1',
            company_name: 'Alpha Appliances',
            city: 'Mumbai',
            state: 'Maharashtra',
            catalogue_id: 'cat-uuid-1',
            original_filename: 'alpha_catalog_2026.pdf',
            file_size_bytes: '1024',
            updated_at: new Date('2026-01-01T00:00:00Z'),
          },
        ]),
      };

      catalogueRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getPublicCatalogues({ page: 1, limit: 10 } as any);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].manufacturerId).toBe('mfr-uuid-1');
      expect(result.data[0].manufacturerName).toBe('Alpha Appliances');
      expect(result.data[0].pdfUrl).toBe('/v1/catalogues/mfr-uuid-1/file');
      expect(result.data[0].downloadUrl).toBe('/v1/catalogues/mfr-uuid-1/file?download=true');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getAccessibleCatalogues', () => {
    it('should query approved manufacturer relationships for an authenticated DISTRIBUTOR', async () => {
      distributorRepo.findOne.mockResolvedValue({ id: 'dist-uuid-1', user_id: 'user-dist-1' });

      const mockQueryBuilder: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            manufacturer_id: 'mfr-uuid-1',
            company_name: 'Alpha Appliances',
            city: 'Mumbai',
            state: 'Maharashtra',
            catalogue_id: 'cat-uuid-1',
            original_filename: 'alpha_catalog_2026.pdf',
            file_size_bytes: '1024',
            updated_at: new Date('2026-01-01T00:00:00Z'),
          },
        ]),
      };

      catalogueRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAccessibleCatalogues(
        { userId: 'user-dist-1', role: 'DISTRIBUTOR_ADMIN' },
        { page: 1, limit: 10 } as any,
      );

      expect(distributorRepo.findOne).toHaveBeenCalledWith({ where: { user_id: 'user-dist-1' } });
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        ManufacturerDistributor,
        'md',
        'md.manufacturer_id = m.id AND md.distributor_id = :distributorId AND md.status = :status',
        { distributorId: 'dist-uuid-1', status: 'APPROVED' },
      );
      expect(result.data).toHaveLength(1);
    });

    it('should query assigned distributor relationships for an authenticated SALESMAN', async () => {
      salesmanRepo.findOne.mockResolvedValue({
        id: 'sales-uuid-1',
        user_id: 'user-sales-1',
        distributor_id: 'dist-uuid-99',
      });

      const mockQueryBuilder: any = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            manufacturer_id: 'mfr-uuid-1',
            company_name: 'Alpha Appliances',
            city: 'Mumbai',
            state: 'Maharashtra',
            catalogue_id: 'cat-uuid-1',
            original_filename: 'alpha_catalog_2026.pdf',
            file_size_bytes: '1024',
            updated_at: new Date('2026-01-01T00:00:00Z'),
          },
        ]),
      };

      catalogueRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getAccessibleCatalogues(
        { userId: 'user-sales-1', role: 'SALESMAN' },
        { page: 1, limit: 10 } as any,
      );

      expect(salesmanRepo.findOne).toHaveBeenCalledWith({ where: { user_id: 'user-sales-1' } });
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        ManufacturerDistributor,
        'md',
        'md.manufacturer_id = m.id AND md.distributor_id = :distributorId AND md.status = :status',
        { distributorId: 'dist-uuid-99', status: 'APPROVED' },
      );
      expect(result.data).toHaveLength(1);
    });

    it('should throw ForbiddenException if distributor profile not found', async () => {
      distributorRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getAccessibleCatalogues(
          { userId: 'unknown-dist', role: 'DISTRIBUTOR_ADMIN' },
          {} as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if salesman is not assigned to a distributor', async () => {
      salesmanRepo.findOne.mockResolvedValue({ id: 's-1', user_id: 'u-1', distributor_id: null });

      await expect(
        service.getAccessibleCatalogues(
          { userId: 'u-1', role: 'SALESMAN' },
          {} as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
