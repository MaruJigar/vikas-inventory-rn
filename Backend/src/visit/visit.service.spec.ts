import { Test, TestingModule } from '@nestjs/testing';
import { VisitService } from './visit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopVisit } from './shop-visit.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Shop } from '../shop/shop.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Order } from '../order/order.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { DataSource } from 'typeorm';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('VisitService', () => {
  let service: VisitService;

  const mockQb = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([{ id: 'v1' }]),
  };

  const mockVisitRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQb),
  };
  const mockSalesmanRepo = { findOne: jest.fn() };
  const mockShopRepo = { findOne: jest.fn() };
  const mockWorkingDayRepo = { findOne: jest.fn() };
  const mockOrderRepo = { count: jest.fn() };
  const mockDistributorRepo = { findOne: jest.fn() };
  const mockManufacturerRepo = { findOne: jest.fn() };
  const mockManufacturerDistributorRepo = { findOne: jest.fn(), find: jest.fn() };
  const mockAuditLogService = { logAction: jest.fn() };
  const mockSocketGateway = { broadcastToRoom: jest.fn() };
  const mockDataSource = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitService,
        { provide: getRepositoryToken(ShopVisit), useValue: mockVisitRepo },
        { provide: getRepositoryToken(Salesman), useValue: mockSalesmanRepo },
        { provide: getRepositoryToken(Shop), useValue: mockShopRepo },
        { provide: getRepositoryToken(WorkingDay), useValue: mockWorkingDayRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(Distributor), useValue: mockDistributorRepo },
        { provide: getRepositoryToken(Manufacturer), useValue: mockManufacturerRepo },
        { provide: getRepositoryToken(ManufacturerDistributor), useValue: mockManufacturerDistributorRepo },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<VisitService>(VisitService);
    jest.clearAllMocks();
  });

  // ─── startVisit ────────────────────────────────────────────────────────────

  describe('startVisit', () => {
    it('Should throw if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.startVisit('u1', { shopId: 's1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw if salesman not approved', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ approval_status: 'PENDING' });
      await expect(service.startVisit('u1', { shopId: 's1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw if no active working day', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue(null);
      await expect(service.startVisit('u1', { shopId: 's1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw NotFoundException if shop not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue(null);
      await expect(service.startVisit('u1', { shopId: 'shop1' })).rejects.toThrow(NotFoundException);
    });

    it('Should throw if shop belongs to different distributor (IDOR attempt)', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd2' }); // different distributor
      await expect(service.startVisit('u1', { shopId: 'shop1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should return existing visit on duplicate idempotency key', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      const existingVisit = { id: 'v_existing' };
      mockVisitRepo.findOne.mockResolvedValue(existingVisit);

      const res = await service.startVisit('u1', { shopId: 'shop1', idempotencyKey: 'key_abc' });
      expect(res).toBe(existingVisit);
      expect(mockVisitRepo.create).not.toHaveBeenCalled(); // idempotency short-circuit
    });

    it('Should reject future startedAt timestamp', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      mockVisitRepo.findOne.mockResolvedValue(null); // no idempotency match

      const futureTs = new Date(Date.now() + 86400000).toISOString(); // +1 day
      await expect(service.startVisit('u1', { shopId: 'shop1', startedAt: futureTs })).rejects.toThrow(BadRequestException);
    });

    it('Should reject invalid (NaN) startedAt timestamp', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      await expect(service.startVisit('u1', { shopId: 'shop1', startedAt: 'not-a-date' })).rejects.toThrow(BadRequestException);
    });

    it('Should start visit with GPS coordinates and emit socket', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      mockVisitRepo.create.mockReturnValue({ id: 'v1', started_at: new Date() });
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', started_at: new Date() });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1' });

      const res = await service.startVisit('u1', { shopId: 'shop1', latitude: 12.9, longitude: 77.5 });
      expect(res.id).toBe('v1');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith('VISIT_STARTED', 'SHOP_VISIT', 'v1', 'u1', expect.any(Object));
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith('distributor:d1', 'VISIT_STARTED', expect.any(Object));
    });

    it('Should start visit with explicit past startedAt timestamp', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      mockVisitRepo.create.mockReturnValue({ id: 'v1', started_at: new Date('2024-01-01T08:00:00Z') });
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', started_at: new Date('2024-01-01T08:00:00Z') });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1' });

      const res = await service.startVisit('u1', { shopId: 'shop1', startedAt: '2024-01-01T08:00:00Z' });
      expect(res.id).toBe('v1');
    });

    it('Should start visit even when distributor lookup fails (no socket emitted)', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', approval_status: 'APPROVED', distributor_id: 'd1' });
      mockWorkingDayRepo.findOne.mockResolvedValue({ id: 'w1' });
      mockShopRepo.findOne.mockResolvedValue({ id: 'shop1', distributor_id: 'd1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      mockVisitRepo.create.mockReturnValue({ id: 'v1', started_at: new Date() });
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', started_at: new Date() });
      mockDistributorRepo.findOne.mockResolvedValue(null); // distributor not found

      const res = await service.startVisit('u1', { shopId: 'shop1' });
      expect(res.id).toBe('v1');
      expect(mockSocketGateway.broadcastToRoom).not.toHaveBeenCalled();
    });
  });

  // ─── endVisit ──────────────────────────────────────────────────────────────

  describe('endVisit', () => {
    it('Should throw if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.endVisit('u1', { visitId: 'v1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw NotFoundException if visit not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      await expect(service.endVisit('u1', { visitId: 'v1' })).rejects.toThrow(NotFoundException);
    });

    it('Should throw ForbiddenException if salesman does not own visit (IDOR attempt)', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's2', status: 'ACTIVE' }); // different salesman
      await expect(service.endVisit('u1', { visitId: 'v1' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw BadRequestException if visit already closed', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'CLOSED' });
      await expect(service.endVisit('u1', { visitId: 'v1' })).rejects.toThrow(BadRequestException);
    });

    it('Should throw if no order and no reason provided', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', no_order_reason: null });
      mockOrderRepo.count.mockResolvedValue(0);
      await expect(service.endVisit('u1', { visitId: 'v1' })).rejects.toThrow(BadRequestException);
    });

    it('Should allow close if no_order_reason already set', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', no_order_reason: 'CLOSED_SHOP', started_at: new Date('2020-01-01'), distributor_id: 'd1' });
      mockOrderRepo.count.mockResolvedValue(0);
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', status: 'CLOSED' });
      const res = await service.endVisit('u1', { visitId: 'v1' });
      expect(res.status).toBe('CLOSED');
    });

    it('Should reject future endedAt timestamp', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', no_order_reason: null, started_at: new Date('2020-01-01') });
      mockOrderRepo.count.mockResolvedValue(1);

      const futureTs = new Date(Date.now() + 86400000).toISOString();
      await expect(service.endVisit('u1', { visitId: 'v1', endedAt: futureTs })).rejects.toThrow(BadRequestException);
    });

    it('Should reject invalid (NaN) endedAt timestamp', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', no_order_reason: null, started_at: new Date('2020-01-01') });
      mockOrderRepo.count.mockResolvedValue(1);
      await expect(service.endVisit('u1', { visitId: 'v1', endedAt: 'not-a-date' })).rejects.toThrow(BadRequestException);
    });

    it('Should reject endedAt before startedAt (impossible timeline)', async () => {
      const startedAt = new Date('2024-06-01T10:00:00Z');
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', no_order_reason: null, started_at: startedAt });
      mockOrderRepo.count.mockResolvedValue(1);

      const beforeStart = new Date('2024-06-01T09:00:00Z').toISOString(); // 1hr before start
      await expect(service.endVisit('u1', { visitId: 'v1', endedAt: beforeStart })).rejects.toThrow(BadRequestException);
    });

    it('Should close visit successfully with GPS and emit socket', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', distributor_id: 'd1', no_order_reason: null, started_at: new Date('2020-01-01') });
      mockOrderRepo.count.mockResolvedValue(1);
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', status: 'CLOSED', ended_at: new Date() });

      const res = await service.endVisit('u1', { visitId: 'v1', latitude: 12.9, longitude: 77.5 });
      expect(res.status).toBe('CLOSED');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith('VISIT_ENDED', 'SHOP_VISIT', 'v1', 'u1', expect.any(Object));
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith('distributor:d1', 'VISIT_ENDED', expect.any(Object));
    });

    it('Should close visit with explicit valid past endedAt', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', distributor_id: 'd1', no_order_reason: null, started_at: new Date('2020-01-01T08:00:00Z') });
      mockOrderRepo.count.mockResolvedValue(1);
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', status: 'CLOSED' });

      const res = await service.endVisit('u1', { visitId: 'v1', endedAt: '2020-01-01T09:00:00Z' });
      expect(res.status).toBe('CLOSED');
    });
  });

  // ─── noOrderVisit ──────────────────────────────────────────────────────────

  describe('noOrderVisit', () => {
    it('Should throw if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw NotFoundException if visit not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue(null);
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('Should throw ForbiddenException if salesman does not own visit (IDOR)', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's_other', status: 'ACTIVE' });
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X' })).rejects.toThrow(ForbiddenException);
    });

    it('Should throw BadRequestException if visit already closed', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'CLOSED' });
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X' })).rejects.toThrow(BadRequestException);
    });

    it('Should reject future endedAt in noOrderVisit', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', started_at: new Date('2020-01-01') });
      const futureTs = new Date(Date.now() + 86400000).toISOString();
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X', endedAt: futureTs })).rejects.toThrow(BadRequestException);
    });

    it('Should reject invalid (NaN) endedAt in noOrderVisit', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', started_at: new Date('2020-01-01') });
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X', endedAt: 'not-a-date' })).rejects.toThrow(BadRequestException);
    });

    it('Should reject endedAt before startedAt in noOrderVisit', async () => {
      const startedAt = new Date('2024-06-01T10:00:00Z');
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', started_at: startedAt });
      const beforeStart = new Date('2024-06-01T09:00:00Z').toISOString();
      await expect(service.noOrderVisit('u1', { visitId: 'v1', reason: 'X', endedAt: beforeStart })).rejects.toThrow(BadRequestException);
    });

    it('Should close visit with reason, GPS and emit socket', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1' });
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', salesman_id: 's1', status: 'ACTIVE', distributor_id: 'd1', started_at: new Date('2020-01-01') });
      mockVisitRepo.save.mockResolvedValue({ id: 'v1', status: 'CLOSED', no_order_reason: 'CLOSED_SHOP' });

      const res = await service.noOrderVisit('u1', { visitId: 'v1', reason: 'CLOSED_SHOP', note: 'shop was locked', latitude: 12.9, longitude: 77.5 });
      expect(res.status).toBe('CLOSED');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith('VISIT_ENDED', 'SHOP_VISIT', 'v1', 'u1', { reason: 'CLOSED_SHOP' });
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith('distributor:d1', 'VISIT_ENDED', expect.any(Object));
    });
  });

  // ─── getVisits ─────────────────────────────────────────────────────────────

  describe('getVisits', () => {
    it('SUPER_ADMIN: should return all visits', async () => {
      mockVisitRepo.find.mockResolvedValue([{ id: 'v1' }, { id: 'v2' }]);
      const res = await service.getVisits('admin1', 'SUPER_ADMIN');
      expect(res).toHaveLength(2);
      expect(mockVisitRepo.find).toHaveBeenCalledWith({ order: { created_at: 'DESC' } });
    });

    it('DISTRIBUTOR_ADMIN: should return only distributor visits', async () => {
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockVisitRepo.find.mockResolvedValue([{ id: 'v1', distributor_id: 'd1' }]);
      const res = await service.getVisits('u1', 'DISTRIBUTOR_ADMIN');
      expect(res).toHaveLength(1);
      expect(mockVisitRepo.find).toHaveBeenCalledWith({ where: { distributor_id: 'd1' }, order: { created_at: 'DESC' } });
    });

    it('DISTRIBUTOR_ADMIN: should throw if distributor not found', async () => {
      mockDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisits('u1', 'DISTRIBUTOR_ADMIN')).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should return visits for linked distributors only', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.find.mockResolvedValue([{ manufacturer_id: 'm1', distributor_id: 'd1' }]);
      mockQb.getMany.mockResolvedValue([{ id: 'v1', distributor_id: 'd1' }]);

      const res = await service.getVisits('u1', 'MANUFACTURER_ADMIN');
      expect(res).toHaveLength(1);
    });

    it('MANUFACTURER_ADMIN: should return empty array if no distributors linked', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.find.mockResolvedValue([]); // no links

      const res = await service.getVisits('u1', 'MANUFACTURER_ADMIN');
      expect(res).toEqual([]);
    });

    it('MANUFACTURER_ADMIN: should throw if manufacturer not found', async () => {
      mockManufacturerRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisits('u1', 'MANUFACTURER_ADMIN')).rejects.toThrow(ForbiddenException);
    });

    it('SALESMAN: should return only own visits', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      mockVisitRepo.find.mockResolvedValue([{ id: 'v1', salesman_id: 's1' }]);
      const res = await service.getVisits('u1', 'SALESMAN');
      expect(res).toHaveLength(1);
      expect(mockVisitRepo.find).toHaveBeenCalledWith({ where: { salesman_id: 's1' }, order: { created_at: 'DESC' } });
    });

    it('SALESMAN: should throw if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisits('u1', 'SALESMAN')).rejects.toThrow(ForbiddenException);
    });

    it('Unknown role: should throw ForbiddenException', async () => {
      await expect(service.getVisits('u1', 'UNKNOWN_ROLE')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getVisitById ──────────────────────────────────────────────────────────

  describe('getVisitById', () => {
    it('Should throw NotFoundException if visit does not exist', async () => {
      mockVisitRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisitById('u1', 'SUPER_ADMIN', 'v_missing')).rejects.toThrow(NotFoundException);
    });

    it('SUPER_ADMIN: should return any visit', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      const res = await service.getVisitById('admin1', 'SUPER_ADMIN', 'v1');
      expect(res.id).toBe('v1');
    });

    it('DISTRIBUTOR_ADMIN: should return visit for own distributor', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      const res = await service.getVisitById('u1', 'DISTRIBUTOR_ADMIN', 'v1');
      expect(res.id).toBe('v1');
    });

    it('DISTRIBUTOR_ADMIN: should reject visit from different distributor (IDOR attempt)', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockDistributorRepo.findOne.mockResolvedValue({ id: 'd2', user_id: 'u1' }); // different dist
      await expect(service.getVisitById('u1', 'DISTRIBUTOR_ADMIN', 'v1')).rejects.toThrow(ForbiddenException);
    });

    it('DISTRIBUTOR_ADMIN: should reject if distributor entity not found', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockDistributorRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisitById('u1', 'DISTRIBUTOR_ADMIN', 'v1')).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should allow access for linked ecosystem', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue({ manufacturer_id: 'm1', distributor_id: 'd1' });
      const res = await service.getVisitById('u1', 'MANUFACTURER_ADMIN', 'v1');
      expect(res.id).toBe('v1');
    });

    it('MANUFACTURER_ADMIN: should reject unlinked distributor visit (IDOR attempt)', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd_other', salesman_id: 's1' });
      mockManufacturerRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockManufacturerDistributorRepo.findOne.mockResolvedValue(null); // not linked
      await expect(service.getVisitById('u1', 'MANUFACTURER_ADMIN', 'v1')).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should throw if manufacturer entity not found', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockManufacturerRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisitById('u1', 'MANUFACTURER_ADMIN', 'v1')).rejects.toThrow(ForbiddenException);
    });

    it('SALESMAN: should return own visit', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      const res = await service.getVisitById('u1', 'SALESMAN', 'v1');
      expect(res.id).toBe('v1');
    });

    it('SALESMAN: should reject access to another salesman visit (IDOR attempt)', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's_victim' });
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's_attacker', user_id: 'u_attacker' });
      await expect(service.getVisitById('u_attacker', 'SALESMAN', 'v1')).rejects.toThrow(ForbiddenException);
    });

    it('SALESMAN: should throw if salesman entity not found', async () => {
      mockVisitRepo.findOne.mockResolvedValue({ id: 'v1', distributor_id: 'd1', salesman_id: 's1' });
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.getVisitById('u1', 'SALESMAN', 'v1')).rejects.toThrow(ForbiddenException);
    });
  });
});
