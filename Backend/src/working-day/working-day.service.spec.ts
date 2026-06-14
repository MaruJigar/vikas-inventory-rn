import { Test, TestingModule } from '@nestjs/testing';
import { WorkingDayService } from './working-day.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkingDay } from './working-day.entity';
import { LocationLog } from '../location/location-log.entity';
import { LatestLocation } from '../location/latest-location.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';

const mockWorkingDayRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockLocationLogRepository = {};
const mockLatestLocationRepository = {};

const mockSalesmanRepository = {
  findOne: jest.fn(),
};

const mockDistributorRepository = {
  findOne: jest.fn(),
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

const mockAuditLogService = {
  logAction: jest.fn(),
};

const mockSocketGateway = {
  broadcastToRoom: jest.fn(),
};

describe('WorkingDayService', () => {
  let service: WorkingDayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkingDayService,
        { provide: getRepositoryToken(WorkingDay), useValue: mockWorkingDayRepository },
        { provide: getRepositoryToken(LocationLog), useValue: mockLocationLogRepository },
        { provide: getRepositoryToken(LatestLocation), useValue: mockLatestLocationRepository },
        { provide: getRepositoryToken(Salesman), useValue: mockSalesmanRepository },
        { provide: getRepositoryToken(Distributor), useValue: mockDistributorRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
      ],
    }).compile();

    service = module.get<WorkingDayService>(WorkingDayService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('Check-In Success: Should check in a valid salesman', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'wd1', check_in_at: new Date() });

      const result = await service.checkIn('u1', { latitude: 10, longitude: 20, device_id: 'dev1' });
      
      expect(result).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith('CHECK_IN', 'WORKING_DAY', 'wd1', 'u1', expect.any(Object));
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith('DISTRIBUTOR_ADMIN:du1', 'SALESMAN_CHECKED_IN', expect.any(Object));
    });

    it('Check-In Failure: Should reject pending salesman', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', approval_status: 'PENDING' });
      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-In Failure: Should reject inactive distributor', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', status: 'SUSPENDED' });
      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-In Failure: Should handle double active working day (ConflictException)', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockRejectedValue({ code: '23505' });

      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ConflictException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('Check-In Failure: Should handle other DB errors', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow('DB Error');
    });

    it('Check-In Idempotency: Should return existing record without saving', async () => {
      mockWorkingDayRepository.findOne.mockResolvedValue({ id: 'wd1', idempotency_key: 'idk1' });
      const result = await service.checkIn('u1', { latitude: 10, longitude: 20, idempotency_key: 'idk1' });
      expect(result).toEqual({ id: 'wd1', idempotency_key: 'idk1' });
      expect(mockSalesmanRepository.findOne).not.toHaveBeenCalled();
    });

    it('Check-In Idempotency: Should proceed if no existing record found', async () => {
      mockWorkingDayRepository.findOne.mockResolvedValue(null);
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'wd1', check_in_at: new Date() });

      const result = await service.checkIn('u1', { latitude: 10, longitude: 20, idempotency_key: 'idk_new' });
      expect(result).toBeDefined();
    });

    it('Check-In Failure: Should reject if distributor not found', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue(null);
      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-In Failure: Should reject if salesman not found', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue(null);
      await expect(service.checkIn('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-In Success: Should update existing latest location', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1', status: 'ACTIVE' });
      mockQueryRunner.manager.save.mockResolvedValue({ id: 'wd1', check_in_at: new Date() });
      
      const existingLatest = { salesman_id: 's1', is_tracking_active: false };
      mockQueryRunner.manager.findOne.mockResolvedValue(existingLatest);

      await service.checkIn('u1', { latitude: 10, longitude: 20 });
      expect(existingLatest.is_tracking_active).toBe(true);
    });
  });

  describe('checkOut', () => {
    it('Check-Out Success: Should complete active working day', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValue({ id: 'wd1', status: 'ACTIVE', salesman_id: 's1' });
      mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve(entity));
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1', user_id: 'du1' });

      const result = await service.checkOut('u1', { latitude: 10, longitude: 20 });
      
      expect(result.status).toBe('COMPLETED');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith('CHECK_OUT', 'WORKING_DAY', 'wd1', 'u1', expect.any(Object));
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith('DISTRIBUTOR_ADMIN:du1', 'SALESMAN_CHECKED_OUT', expect.any(Object));
    });

    it('Check-Out Failure: Should reject without active working day', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      await expect(service.checkOut('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(BadRequestException);
    });

    it('Check-Out Failure: Should reject pending salesman', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', approval_status: 'PENDING' });
      await expect(service.checkOut('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-Out Failure: Should handle double completion conflict', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValue({ id: 'wd1', status: 'ACTIVE', salesman_id: 's1' });
      mockQueryRunner.manager.save.mockRejectedValue({ code: '23505' });

      await expect(service.checkOut('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ConflictException);
    });

    it('Check-Out Failure: Should handle other DB errors', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValue({ id: 'wd1', status: 'ACTIVE', salesman_id: 's1' });
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.checkOut('u1', { latitude: 10, longitude: 20 })).rejects.toThrow('DB Error');
    });

    it('Check-Out Idempotency: Should return existing record without saving', async () => {
      mockWorkingDayRepository.findOne.mockResolvedValue({ id: 'wd1', status: 'COMPLETED', idempotency_key: 'idk2' });
      const result = await service.checkOut('u1', { latitude: 10, longitude: 20, idempotency_key: 'idk2' });
      expect(result).toEqual({ id: 'wd1', status: 'COMPLETED', idempotency_key: 'idk2' });
      expect(mockSalesmanRepository.findOne).not.toHaveBeenCalled();
    });

    it('Check-Out Failure: Should reject if salesman not found', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue(null);
      await expect(service.checkOut('u1', { latitude: 10, longitude: 20 })).rejects.toThrow(ForbiddenException);
    });

    it('Check-Out Success: Should proceed with device_id and new idempotency_key', async () => {
      mockWorkingDayRepository.findOne.mockResolvedValue(null);
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ id: 'wd1', status: 'ACTIVE', salesman_id: 's1' }); // Active WD
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ salesman_id: 's1' }); // LatestLocation
      
      mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve(entity));
      mockDistributorRepository.findOne.mockResolvedValue(null);

      const result = await service.checkOut('u1', { latitude: 10, longitude: 20, device_id: 'dev2', idempotency_key: 'idk_new' });
      expect(result.device_id).toBe('dev2');
      expect(result.idempotency_key).toBe('idk_new');
    });

    it('Check-Out Success: Should skip latest location and socket if not found', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1', user_id: 'u1', distributor_id: 'd1', approval_status: 'APPROVED' });
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({ id: 'wd1', status: 'ACTIVE', salesman_id: 's1' }); // Active WD
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null); // No LatestLocation
      
      mockQueryRunner.manager.save.mockImplementation((entity) => Promise.resolve(entity));
      mockDistributorRepository.findOne.mockResolvedValue(null); // No Distributor

      const result = await service.checkOut('u1', { latitude: 10, longitude: 20 });
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('getHistory', () => {
    it('Should get history for SALESMAN', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue({ id: 's1' });
      mockWorkingDayRepository.find.mockResolvedValue([{ id: 'wd1' }]);
      const res = await service.getHistory('u1', 'SALESMAN');
      expect(res).toEqual([{ id: 'wd1' }]);
    });

    it('Should return empty array for missing SALESMAN', async () => {
      mockSalesmanRepository.findOne.mockResolvedValue(null);
      const res = await service.getHistory('u1', 'SALESMAN');
      expect(res).toEqual([]);
    });

    it('Should get history for DISTRIBUTOR_ADMIN', async () => {
      mockDistributorRepository.findOne.mockResolvedValue({ id: 'd1' });
      mockWorkingDayRepository.find.mockResolvedValue([{ id: 'wd1' }]);
      const res = await service.getHistory('du1', 'DISTRIBUTOR_ADMIN');
      expect(res).toEqual([{ id: 'wd1' }]);
    });

    it('Should return empty array for missing DISTRIBUTOR_ADMIN', async () => {
      mockDistributorRepository.findOne.mockResolvedValue(null);
      const res = await service.getHistory('du1', 'DISTRIBUTOR_ADMIN');
      expect(res).toEqual([]);
    });

    it('Should get history for MANUFACTURER_ADMIN', async () => {
      mockWorkingDayRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'wd1' }])
      });
      const res = await service.getHistory('mu1', 'MANUFACTURER_ADMIN', ['d1']);
      expect(res).toEqual([{ id: 'wd1' }]);
    });

    it('Should return empty array for MANUFACTURER_ADMIN with no distributors', async () => {
      const res = await service.getHistory('mu1', 'MANUFACTURER_ADMIN', []);
      expect(res).toEqual([]);
    });

    it('Should get history for SUPER_ADMIN', async () => {
      mockWorkingDayRepository.find.mockResolvedValue([{ id: 'wd1' }]);
      const res = await service.getHistory('su1', 'SUPER_ADMIN');
      expect(res).toEqual([{ id: 'wd1' }]);
    });

    it('Should return empty array for UNKNOWN role', async () => {
      const res = await service.getHistory('u1', 'UNKNOWN');
      expect(res).toEqual([]);
    });
  });
});
