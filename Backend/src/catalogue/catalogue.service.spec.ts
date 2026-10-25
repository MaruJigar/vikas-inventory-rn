import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CatalogueService } from './catalogue.service';
import { ManufacturerCatalogue } from './entities/manufacturer-catalogue.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
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
    };

    manufacturerRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
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

  describe('getCatalogueByManufacturerId ownership checks', () => {
    it('should allow manufacturer admin to access their own catalogue', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);
      catalogueRepo.findOne.mockResolvedValue(mockCatalogue);

      const result = await service.getCatalogueByManufacturerId('mfr-uuid-1', {
        userId: 'user-uuid-1',
        role: 'MANUFACTURER_ADMIN',
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockCatalogue.id);
    });

    it('should forbid manufacturer admin from accessing another manufacturer catalogue', async () => {
      manufacturerRepo.findOne.mockResolvedValue(mockManufacturer);

      await expect(
        service.getCatalogueByManufacturerId('mfr-uuid-other', {
          userId: 'user-uuid-1',
          role: 'MANUFACTURER_ADMIN',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to access any manufacturer catalogue', async () => {
      catalogueRepo.findOne.mockResolvedValue(mockCatalogue);

      const result = await service.getCatalogueByManufacturerId('mfr-uuid-1', {
        userId: 'super-admin-uuid',
        role: 'SUPER_ADMIN',
      });
      expect(result).not.toBeNull();
    });
  });
});
