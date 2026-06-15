import { Test, TestingModule } from '@nestjs/testing';
import { BackordersService } from './backorders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Backorder } from '../order/backorder.entity';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { NotificationService } from '../notification/notification.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DistributorInventory } from './distributor-inventory.entity';

describe('BackordersService', () => {
  let service: BackordersService;

  let managerRepos: any = {};

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: jest.fn().mockImplementation((entity) => {
        return managerRepos[entity.name];
      }),
      create: jest.fn().mockImplementation((entity, obj) => obj),
      save: jest.fn().mockImplementation(async (entity, obj) => obj),
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 'o1') return { id: 'o1', salesman_id: 's1' };
        return null;
      }),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockAuditLogService = { logAction: jest.fn() };
  const mockSocketGateway = { broadcastToRoom: jest.fn() };
  const mockNotificationService = { createNotification: jest.fn() };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([{ id: 'b1' }]),
    getOne: jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'b1',
        quantity: 10,
        resolved_quantity: 0,
        status: 'OPEN',
        distributor_id: 'd1',
        product_id: 'p1',
        order_item_id: 'i1',
        order_id: 'o1',
      }),
    ),
  };

  const mockBackorderRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    managerRepos = {
      Backorder: {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      },
      DistributorInventory: {
        createQueryBuilder: jest.fn().mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            available_quantity: 20,
            reserved_quantity: 5,
            backordered_quantity: 10,
            distributor_id: 'd1',
            product_id: 'p1',
          }),
        }),
      },
      OrderItem: {
        createQueryBuilder: jest.fn().mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            id: 'i1',
            reserved_quantity: 0,
            backordered_quantity: 10,
          }),
        }),
      },
      Order: {
        findOne: jest.fn().mockResolvedValue({ id: 'o1', salesman_id: 's1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackordersService,
        { provide: getRepositoryToken(Backorder), useValue: mockBackorderRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<BackordersService>(BackordersService);
  });

  describe('listBackorders', () => {
    it('should return backorders for DISTRIBUTOR_ADMIN', async () => {
      const res = await service.listBackorders('DISTRIBUTOR_ADMIN', 'd1', {
        status: 'OPEN',
      });
      expect(res).toEqual([{ id: 'b1' }]);
    });

    it('should return backorders for SUPER_ADMIN', async () => {
      const res = await service.listBackorders('SUPER_ADMIN', 's1', {
        distributorId: 'd1',
      });
      expect(res).toEqual([{ id: 'b1' }]);
    });

    it('should throw Forbidden for SALESMAN', async () => {
      await expect(service.listBackorders('SALESMAN', 's1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getBackorder', () => {
    it('should return a backorder', async () => {
      const res = await service.getBackorder('b1', 'DISTRIBUTOR_ADMIN', 'd1');
      expect(res.id).toEqual('b1');
    });

    it('should throw Forbidden for SALESMAN', async () => {
      await expect(
        service.getBackorder('b1', 'SALESMAN', 's1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('allocateBackorder', () => {
    it('should partially allocate backorder successfully', async () => {
      const res = await service.allocateBackorder('b1', 4, 'd1');
      expect(res.status).toEqual('PARTIALLY_ALLOCATED');
      expect(res.resolved_quantity).toEqual(4);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'd1',
        'BACKORDER_PARTIALLY_ALLOCATED',
        'Backorder',
        'b1',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'backorder:allocated',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'inventory:updated',
        expect.any(Object),
      );
    });

    it('should fully allocate backorder successfully', async () => {
      const res = await service.allocateBackorder('b1', 10, 'd1');
      expect(res.status).toEqual('RESOLVED');
      expect(res.resolved_quantity).toEqual(10);
      expect(res.resolved_at).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'd1',
        'BACKORDER_RESOLVED',
        'Backorder',
        'b1',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'backorder:resolved',
        expect.any(Object),
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        's1',
        'BACKORDER_RESOLVED_ALERT',
        expect.any(String),
      );
    });

    it('should throw BadRequest if allocating more than unfulfilled', async () => {
      await expect(service.allocateBackorder('b1', 15, 'd1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequest if available quantity is insufficient', async () => {
      managerRepos.DistributorInventory.createQueryBuilder = jest
        .fn()
        .mockReturnValue({
          setLock: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue({
            available_quantity: 2,
            reserved_quantity: 5,
            backordered_quantity: 10,
            distributor_id: 'd1',
            product_id: 'p1',
          }),
        });
      await expect(service.allocateBackorder('b1', 5, 'd1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if <= 0', async () => {
      await expect(service.allocateBackorder('b1', 0, 'd1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
