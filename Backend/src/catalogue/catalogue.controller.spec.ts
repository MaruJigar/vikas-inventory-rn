import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';

describe('CatalogueController', () => {
  let controller: CatalogueController;
  let service: any;
  let reflector: Reflector;

  const mockPublicCatalogue = {
    manufacturerId: 'mfr-uuid-1',
    manufacturerName: 'Alpha Appliances',
    fileName: 'alpha_catalog_2026.pdf',
    fileSizeBytes: 1024,
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    city: 'Mumbai',
    state: 'Maharashtra',
    pdfUrl: '/v1/catalogues/mfr-uuid-1/file',
    downloadUrl: '/v1/catalogues/mfr-uuid-1/file?download=true',
  };

  beforeEach(async () => {
    service = {
      getPublicCatalogues: jest.fn(),
      getAccessibleCatalogues: jest.fn(),
      getCatalogueByManufacturerId: jest.fn(),
      streamCatalogueFile: jest.fn(),
      getOwnCatalogue: jest.fn(),
      uploadOwnCatalogue: jest.fn(),
      replaceOwnCatalogue: jest.fn(),
      deleteOwnCatalogue: jest.fn(),
      saveOrReplaceCatalogue: jest.fn(),
      deleteCatalogueByManufacturerId: jest.fn(),
      getManufacturerByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogueController],
      providers: [
        {
          provide: CatalogueService,
          useValue: service,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<CatalogueController>(CatalogueController);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('Public decorator checks', () => {
    it('getPublicCatalogues handler should be marked @Public()', () => {
      const isPublic = reflector.get<boolean>(
        IS_PUBLIC_KEY,
        controller.getPublicCatalogues,
      );
      expect(isPublic).toBe(true);
    });

    it('getCatalogueByManufacturerId handler should be marked @Public()', () => {
      const isPublic = reflector.get<boolean>(
        IS_PUBLIC_KEY,
        controller.getCatalogueByManufacturerId,
      );
      expect(isPublic).toBe(true);
    });

    it('serveCatalogueFile handler should be marked @Public()', () => {
      const isPublic = reflector.get<boolean>(
        IS_PUBLIC_KEY,
        controller.serveCatalogueFile,
      );
      expect(isPublic).toBe(true);
    });

    it('write operations must NOT be marked @Public()', () => {
      expect(
        reflector.get<boolean>(IS_PUBLIC_KEY, controller.uploadOwnCatalogue),
      ).toBeUndefined();
      expect(
        reflector.get<boolean>(IS_PUBLIC_KEY, controller.replaceOwnCatalogue),
      ).toBeUndefined();
      expect(
        reflector.get<boolean>(IS_PUBLIC_KEY, controller.deleteOwnCatalogue),
      ).toBeUndefined();
      expect(
        reflector.get<boolean>(IS_PUBLIC_KEY, controller.adminUploadCatalogue),
      ).toBeUndefined();
      expect(
        reflector.get<boolean>(IS_PUBLIC_KEY, controller.adminDeleteCatalogue),
      ).toBeUndefined();
    });
  });

  describe('getPublicCatalogues', () => {
    it('should return public catalogue listing without authentication', async () => {
      service.getPublicCatalogues.mockResolvedValue({
        data: [mockPublicCatalogue],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const res = await controller.getPublicCatalogues({ page: 1, limit: 10 } as any);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].manufacturerId).toBe('mfr-uuid-1');
      expect(service.getPublicCatalogues).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('getAccessibleCatalogues', () => {
    it('should pass authenticated user and query to service', async () => {
      service.getAccessibleCatalogues.mockResolvedValue({
        data: [mockPublicCatalogue],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const req = { user: { userId: 'u-1', role: 'DISTRIBUTOR_ADMIN' } };
      const res = await controller.getAccessibleCatalogues(req, { page: 1, limit: 10 } as any);

      expect(res.data).toHaveLength(1);
      expect(service.getAccessibleCatalogues).toHaveBeenCalledWith(
        { userId: 'u-1', role: 'DISTRIBUTOR_ADMIN' },
        { page: 1, limit: 10 },
      );
    });
  });

  describe('getCatalogueByManufacturerId', () => {
    it('should return metadata when found for anonymous request', async () => {
      service.getCatalogueByManufacturerId.mockResolvedValue(mockPublicCatalogue);

      const req = {}; // No user on request
      const res = await controller.getCatalogueByManufacturerId(req, 'mfr-uuid-1');
      expect(res).toBe(mockPublicCatalogue);
      expect(service.getCatalogueByManufacturerId).toHaveBeenCalledWith('mfr-uuid-1', undefined);
    });

    it('should throw NotFoundException if catalogue not found', async () => {
      service.getCatalogueByManufacturerId.mockResolvedValue(null);

      const req = {};
      await expect(
        controller.getCatalogueByManufacturerId(req, 'unknown-mfr'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('serveCatalogueFile', () => {
    it('should stream catalogue PDF anonymously with inline viewing', async () => {
      const mockRes: any = {};

      await controller.serveCatalogueFile('mfr-uuid-1', mockRes, undefined);

      expect(service.streamCatalogueFile).toHaveBeenCalledWith(
        'mfr-uuid-1',
        mockRes,
        false,
      );
    });

    it('should stream catalogue PDF as attachment when download=true', async () => {
      const mockRes: any = {};

      await controller.serveCatalogueFile('mfr-uuid-1', mockRes, 'true');

      expect(service.streamCatalogueFile).toHaveBeenCalledWith(
        'mfr-uuid-1',
        mockRes,
        true,
      );
    });
  });
});
