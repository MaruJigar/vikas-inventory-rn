import { Test, TestingModule } from '@nestjs/testing';
import { DistributorService } from './distributor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Distributor } from './distributor.entity';
import { ManufacturerDistributor } from './manufacturer-distributor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

describe('DistributorService - Ownership Governance', () => {
  let service: DistributorService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockDistributorRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributorService,
        { provide: getRepositoryToken(Distributor), useValue: mockDistributorRepo },
        { provide: getRepositoryToken(ManufacturerDistributor), useValue: {} },
        { provide: AuditLogService, useValue: {} },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DistributorService>(DistributorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDistributorById - IDOR Protection', () => {
    it('should throw ForbiddenException if Manufacturer profile is missing', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // No profile found

      await expect(
        service.getDistributorById('user-1', 'MANUFACTURER_ADMIN', 'dist-1')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should inject innerJoin and throw ForbiddenException if ownership edge is missing', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'mfr-1' }]);
      mockQueryBuilder.getOne.mockResolvedValueOnce(null); // Join failed to find the record

      await expect(
        service.getDistributorById('user-1', 'MANUFACTURER_ADMIN', 'dist-1')
      ).rejects.toThrow(ForbiddenException);

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'manufacturer_distributors',
        'md',
        'md.distributor_id = distributor.id AND md.manufacturer_id = :manufacturerId',
        { manufacturerId: 'mfr-1' }
      );
    });

    it('should return distributor if ownership edge exists', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'mfr-1' }]);
      const dist = { id: 'dist-1', business_name: 'Test' };
      mockQueryBuilder.getOne.mockResolvedValueOnce(dist);

      const result = await service.getDistributorById('user-1', 'MANUFACTURER_ADMIN', 'dist-1');

      expect(result).toEqual(dist);
    });

    it('should allow SUPER_ADMIN to fetch without innerJoin', async () => {
      const dist = { id: 'dist-1', business_name: 'Test' };
      mockQueryBuilder.getOne.mockResolvedValueOnce(dist);

      const result = await service.getDistributorById('user-2', 'SUPER_ADMIN', 'dist-1');

      expect(result).toEqual(dist);
      expect(mockQueryBuilder.innerJoin).not.toHaveBeenCalled();
    });
  });
});
