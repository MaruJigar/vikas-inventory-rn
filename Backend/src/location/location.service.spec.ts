import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationLog } from './location-log.entity';
import { LatestLocation } from './latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { DataSource } from 'typeorm';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;

  const mockLocationLogRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockLatestLocationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const mockSalesmanRepo = {
    findOne: jest.fn(),
  };
  const mockDistributorRepo = {
    findOne: jest.fn(),
  };
  const mockWorkingDayRepo = {
    findOne: jest.fn(),
  };
  const mockManufacturerRepo = {
    findOne: jest.fn(),
  };
  const mockManufacturerDistributorRepo = {
    findOne: jest.fn(),
  };
  const mockAuditLogService = {
    logAction: jest.fn(),
  };
  const mockSocketGateway = {
    broadcastToRoom: jest.fn(),
  };
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn().mockImplementation((entity, data) => data || {}),
      save: jest.fn(),
      findOne: jest.fn(),
    },
  };
  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: getRepositoryToken(LocationLog), useValue: mockLocationLogRepo },
        { provide: getRepositoryToken(LatestLocation), useValue: mockLatestLocationRepo },
        { provide: getRepositoryToken(Salesman), useValue: mockSalesmanRepo },
        { provide: getRepositoryToken(Distributor), useValue: mockDistributorRepo },
        { provide: getRepositoryToken(WorkingDay), useValue: mockWorkingDayRepo },
        { provide: getRepositoryToken(Manufacturer), useValue: mockManufacturerRepo },
        { provide: getRepositoryToken(ManufacturerDistributor), useValue: mockManufacturerDistributorRepo },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    jest.clearAllMocks();
  });

  describe('uploadLocation', () => {
    it('Should reject if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.uploadLocation('u1', { latitude: 10, longitude: 20, captured_at: new Date().toISOString() }))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should reject if no active check-in', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      mockWorkingDayRepo.findOne.mockResolvedValue(null);
      await expect(service.uploadLocation('u1', { latitude: 10, longitude: 20, captured_at: new Date().toISOString() }))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should process location correctly', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockLocationLogRepo.findOne.mockResolvedValue(null);
      mockLocationLogRepo.create.mockReturnValue({ id: 'log1' });
      mockLocationLogRepo.save.mockResolvedValue({ id: 'log1' });
      mockLatestLocationRepo.findOne.mockResolvedValue(null);
      mockLatestLocationRepo.create.mockReturnValue({ salesman_id: 's1' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1' });

      const dto = { latitude: 10, longitude: 20, captured_at: new Date().toISOString() };
      const res = await service.uploadLocation('u1', dto);

      expect(res).toBeDefined();
      expect(mockLatestLocationRepo.save).toHaveBeenCalled();
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalled();
    });

    it('Should handle idempotency correctly', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockLocationLogRepo.findOne.mockResolvedValue({ id: 'existing_log' });

      const dto = { latitude: 10, longitude: 20, captured_at: new Date().toISOString(), idempotency_key: 'testkey' };
      const res = await service.uploadLocation('u1', dto);

      expect(res).toEqual({ id: 'existing_log' });
      expect(mockLocationLogRepo.save).not.toHaveBeenCalled();
    });

    it('Should update existing latest location correctly', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockLocationLogRepo.findOne.mockResolvedValue(null);
      mockLocationLogRepo.create.mockReturnValue({ id: 'log1' });
      mockLocationLogRepo.save.mockResolvedValue({ id: 'log1' });
      
      const oldDate = new Date(0);
      mockLatestLocationRepo.findOne.mockResolvedValue({ salesman_id: 's1', last_updated_at: oldDate });
      
      const newDate = new Date();
      const dto = { latitude: 10, longitude: 20, captured_at: newDate.toISOString() };
      await service.uploadLocation('u1', dto);

      expect(mockLatestLocationRepo.save).toHaveBeenCalled();
    });

    it('Should skip socket update if distributor missing', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockLocationLogRepo.findOne.mockResolvedValue(null);
      mockLocationLogRepo.create.mockReturnValue({ id: 'log1' });
      mockDistributorRepo.findOne.mockResolvedValue(null);

      await service.uploadLocation('u1', { latitude: 10, longitude: 20, captured_at: new Date().toISOString() });

      expect(mockSocketGateway.broadcastToRoom).not.toHaveBeenCalled();
    });
  });

  describe('batchUploadLocations', () => {
    it('Should reject if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.batchUploadLocations('u1', { locations: [] }))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should process batch successfully', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1' });

      const dto = { 
        locations: [
          { latitude: 10, longitude: 20, captured_at: new Date('2023-01-01').toISOString() },
          { latitude: 11, longitude: 21, captured_at: new Date('2023-01-02').toISOString() }
        ] 
      };

      const res = await service.batchUploadLocations('u1', dto);
      expect(res.synced_count).toBe(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalled();
    });

    it('Should rollback on error', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      const dto = { locations: [{ latitude: 10, longitude: 20, captured_at: new Date().toISOString() }] };

      await expect(service.batchUploadLocations('u1', dto)).rejects.toThrow('DB Error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
    
    it('Should skip socket update if no latest point in batch', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      // All existing due to idempotency
      mockQueryRunner.manager.findOne.mockResolvedValue({ id: 'log' }); 

      const dto = { locations: [{ latitude: 10, longitude: 20, captured_at: new Date().toISOString(), idempotency_key: 'test' }] };

      const res = await service.batchUploadLocations('u1', dto);
      expect(res.synced_count).toBe(0);
      expect(mockSocketGateway.broadcastToRoom).not.toHaveBeenCalled();
    });
    
    it('Should skip socket update if distributor missing in batch', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      mockQueryRunner.manager.save.mockResolvedValue([]);
      mockDistributorRepo.findOne.mockResolvedValue(null); 

      const dto = { locations: [{ latitude: 10, longitude: 20, captured_at: new Date().toISOString() }] };

      const res = await service.batchUploadLocations('u1', dto);
      expect(res.synced_count).toBe(1);
      expect(mockSocketGateway.broadcastToRoom).not.toHaveBeenCalled();
    });
    
    it('Should skip latest location update if batch is older', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'wd1', salesman_id: 's1', status: 'ACTIVE' });
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); // locLog not found
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ salesman_id: 's1', last_updated_at: new Date('2023-01-05') }); // latest
      mockQueryRunner.manager.save.mockResolvedValue([]);
      
      const dto = { locations: [{ latitude: 10, longitude: 20, captured_at: new Date('2023-01-01').toISOString() }] };

      await service.batchUploadLocations('u1', dto);
      // It won't call save on latest since maxDate < last_updated_at
    });
  });

  describe('getLiveLocation', () => {
    it('Should reject if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.getLiveLocation('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(BadRequestException);
    });

    it('Should reject if distributor admin does not own salesman', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd2' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      await expect(service.getLiveLocation('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });
    
    it('Should reject if distributor admin not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd2' });
      mockDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getLiveLocation('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should return location for distributor', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockLatestLocationRepo.findOne.mockResolvedValue({ location: {} });

      const res = await service.getLiveLocation('u1', 'DISTRIBUTOR_ADMIN', 's1');
      expect(res).toBeDefined();
    });

    it('Should reject if manufacturer admin does not own distributor', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getLiveLocation('u1', 'MANUFACTURER_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should allow manufacturer access to owned ecosystem', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue({ manufacturer_id: 'm1', distributor_id: 'd1' });
      mockLatestLocationRepo.findOne.mockResolvedValue({ location: {} });

      const res = await service.getLiveLocation('u1', 'MANUFACTURER_ADMIN', 's1');
      expect(res).toBeDefined();
    });
  });

  describe('getLocationHistory', () => {
    it('Should reject if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.getLocationHistory('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(BadRequestException);
    });

    it('Should reject if distributor admin does not own salesman', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd2' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      await expect(service.getLocationHistory('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });
    
    it('Should reject if distributor admin not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd2' });
      mockDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getLocationHistory('u1', 'DISTRIBUTOR_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should return history', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockLocationLogRepo.find.mockResolvedValue([{ location: {} }]);

      const res = await service.getLocationHistory('u1', 'DISTRIBUTOR_ADMIN', 's1');
      expect(res).toBeDefined();
    });

    it('Should reject if manufacturer admin does not own distributor in history', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getLocationHistory('u1', 'MANUFACTURER_ADMIN', 's1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('Should allow manufacturer access to owned ecosystem in history', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', distributor_id: 'd1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue({ manufacturer_id: 'm1', distributor_id: 'd1' });
      mockLocationLogRepo.find.mockResolvedValue([{ location: {} }]);

      const res = await service.getLocationHistory('u1', 'MANUFACTURER_ADMIN', 's1');
      expect(res).toBeDefined();
    });
  });
});
