import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from './shop.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shop } from './shop.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ShopDuplicateDetectionService } from '../shop-duplicate-detection/shop-duplicate-detection.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UploadedFile } from '../shop-image/uploaded-file.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

describe('ShopService - Manufacturer Access Restrictions', () => {
  let service: ShopService;
  let dataSource: any;
  let shopRepo: any;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(2),
    getRawMany: jest.fn().mockResolvedValue([
      { id: 'shop-1', name: 'Alpha Stores', city: 'Mumbai', state: 'Maharashtra' },
      { id: 'shop-2', name: 'Beta Mart', city: 'Pune', state: 'Maharashtra' },
    ]),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getOne: jest.fn().mockResolvedValue(null),
  };

  const mockShopRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopService,
        { provide: getRepositoryToken(Shop), useValue: mockShopRepo },
        { provide: getRepositoryToken(Distributor), useValue: {} },
        { provide: getRepositoryToken(Salesman), useValue: {} },
        { provide: getRepositoryToken(UploadedFile), useValue: {} },
        { provide: getRepositoryToken(ApprovalRequest), useValue: {} },
        { provide: ShopDuplicateDetectionService, useValue: {} },
        { provide: AuditLogService, useValue: { logAction: jest.fn() } },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ShopService>(ShopService);
    dataSource = module.get(DataSource);
    shopRepo = module.get(getRepositoryToken(Shop));
  });

  describe('getManufacturerShops', () => {
    it('should query manufacturer linked shops and return only id, name, city, state', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'mfr-123' }]);

      const result = await service.getManufacturerShops('user-mfr-1', { page: 1, limit: 10 } as any);

      expect(mockDataSource.query).toHaveBeenCalledWith(
        'SELECT id FROM manufacturers WHERE user_id = $1',
        ['user-mfr-1'],
      );
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = shop.distributor_id AND md.manufacturer_id = :mfrId',
        { mfrId: 'mfr-123' },
      );
      expect(result.data).toEqual([
        { id: 'shop-1', name: 'Alpha Stores', city: 'Mumbai', state: 'Maharashtra' },
        { id: 'shop-2', name: 'Beta Mart', city: 'Pune', state: 'Maharashtra' },
      ]);
      expect(result.meta.total).toBe(2);
    });

    it('should throw ForbiddenException if manufacturer profile not found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await expect(
        service.getManufacturerShops('unknown-user', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getShops - Regular endpoint role boundary', () => {
    it('should reject MANUFACTURER_ADMIN with ForbiddenException', async () => {
      await expect(
        service.getShops('user-mfr-1', 'MANUFACTURER_ADMIN', {} as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getShopById - Regular endpoint role boundary', () => {
    it('should reject MANUFACTURER_ADMIN with ForbiddenException', async () => {
      await expect(
        service.getShopById('shop-1', 'user-mfr-1', 'MANUFACTURER_ADMIN'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
