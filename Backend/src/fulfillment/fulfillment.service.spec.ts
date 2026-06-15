import { Test, TestingModule } from '@nestjs/testing';
import { FulfillmentService } from './fulfillment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderStatusHistory } from '../order/order-status-history.entity';
import { FulfillmentLog } from '../order/fulfillment-log.entity';
import { Backorder } from '../order/backorder.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { Distributor } from '../distributor/distributor.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('FulfillmentService', () => {
  let service: FulfillmentService;
  let mockOrderRepo: any;
  let mockDistRepo: any;
  let mockDataSource: any;
  let mockAuditLogService: any;
  let mockSocketGateway: any;
  let managerRepos: Record<string, any>;

  const mockManagerRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    update: jest.fn(),
    decrement: jest.fn(),
    increment: jest.fn(),
  });

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  });

  beforeEach(async () => {
    managerRepos = {};
    mockAuditLogService = { logAction: jest.fn() };
    mockSocketGateway = { broadcastToRoom: jest.fn() };
    mockDataSource = {
      transaction: jest.fn(async (cb) => {
        const manager = {
          getRepository: jest.fn((entity) => {
            const key = entity.name || String(entity);
            if (!managerRepos[key]) managerRepos[key] = mockManagerRepo();
            return managerRepos[key];
          }),
        };
        return cb(manager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FulfillmentService,
        { provide: getRepositoryToken(Order), useFactory: mockRepo },
        { provide: getRepositoryToken(Distributor), useFactory: mockRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
      ],
    }).compile();

    service = module.get<FulfillmentService>(FulfillmentService);
    mockOrderRepo = module.get(getRepositoryToken(Order));
    mockDistRepo = module.get(getRepositoryToken(Distributor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createdOrder = {
    id: 'o1',
    status: 'CREATED',
    distributor_id: 'd1',
    salesman_id: 's1',
    order_number: 'ORD-1',
  };
  const confirmedOrder = { ...createdOrder, status: 'CONFIRMED' };
  const processingOrder = { ...createdOrder, status: 'PROCESSING' };
  const packedOrder = { ...createdOrder, status: 'PACKED' };
  const dispatchedOrder = { ...createdOrder, status: 'DISPATCHED' };

  describe('Full Transitions', () => {
    beforeEach(() => {
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      managerRepos['Order'] = mockManagerRepo();
      managerRepos['OrderStatusHistory'] = mockManagerRepo();
      managerRepos['FulfillmentLog'] = mockManagerRepo();
      managerRepos['OrderItem'] = {
        ...mockManagerRepo(),
        find: jest.fn().mockResolvedValue([
          {
            id: 'i1',
            product_id: 'p1',
            reserved_quantity: 5,
            backordered_quantity: 0,
            dispatched_quantity: 0,
          },
        ]),
      };
      managerRepos['DistributorInventory'] = mockManagerRepo();
      managerRepos['InventoryMovement'] = mockManagerRepo();
      managerRepos['Backorder'] = mockManagerRepo();

      managerRepos['Order'].findOne.mockResolvedValue(createdOrder); // lock return
      managerRepos['DistributorInventory'].findOne.mockResolvedValue({
        available_quantity: 10,
        reserved_quantity: 5,
      }); // lock return
    });

    it('confirmOrder: should transition CREATED → CONFIRMED', async () => {
      mockOrderRepo.findOne
        .mockResolvedValueOnce(createdOrder)
        .mockResolvedValueOnce(confirmedOrder);
      const result = await service.confirmOrder('u1', 'o1', {});
      expect(result.status).toBe('CONFIRMED');
      expect(managerRepos['Order'].update).toHaveBeenCalledWith('o1', {
        status: 'CONFIRMED',
      });
      expect(managerRepos['FulfillmentLog'].save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CONFIRMED' }),
      );
    });

    it('processingOrder: should transition CONFIRMED → PROCESSING', async () => {
      managerRepos['Order'].findOne.mockResolvedValue(confirmedOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(confirmedOrder)
        .mockResolvedValueOnce(processingOrder);
      const result = await service.processingOrder('u1', 'o1', {});
      expect(result.status).toBe('PROCESSING');
    });

    it('packedOrder: should transition PROCESSING → PACKED', async () => {
      managerRepos['Order'].findOne.mockResolvedValue(processingOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(processingOrder)
        .mockResolvedValueOnce(packedOrder);
      const result = await service.packedOrder('u1', 'o1', {});
      expect(result.status).toBe('PACKED');
    });

    it('dispatchOrder: should transition PACKED → DISPATCHED and decrement inventory', async () => {
      managerRepos['Order'].findOne.mockResolvedValue(packedOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(packedOrder)
        .mockResolvedValueOnce(dispatchedOrder);
      const result = await service.dispatchOrder('u1', 'o1', {});
      expect(result.status).toBe('DISPATCHED');
      expect(
        managerRepos['DistributorInventory'].decrement,
      ).toHaveBeenCalledTimes(2); // available and reserved
      expect(managerRepos['InventoryMovement'].save).toHaveBeenCalled();
      expect(managerRepos['OrderItem'].update).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({
          dispatched_quantity: 5,
          status: 'DISPATCHED',
        }),
      );
    });

    it('deliverOrder: should transition DISPATCHED → DELIVERED', async () => {
      managerRepos['Order'].findOne.mockResolvedValue(dispatchedOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(dispatchedOrder)
        .mockResolvedValueOnce({ ...dispatchedOrder, status: 'DELIVERED' });
      const result = await service.deliverOrder('u1', 'o1', {});
      expect(result.status).toBe('DELIVERED');
      expect(managerRepos['OrderItem'].update).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({ status: 'DELIVERED' }),
      );
    });
  });

  describe('Partial Fulfillment', () => {
    beforeEach(() => {
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      managerRepos['Order'] = mockManagerRepo();
      managerRepos['OrderStatusHistory'] = mockManagerRepo();
      managerRepos['FulfillmentLog'] = mockManagerRepo();
      managerRepos['DistributorInventory'] = mockManagerRepo();
      managerRepos['InventoryMovement'] = mockManagerRepo();
      managerRepos['Backorder'] = mockManagerRepo();
      managerRepos['OrderItem'] = mockManagerRepo();
    });

    it('partialDispatchOrder: should dispatch partially and resolve backorder logic', async () => {
      managerRepos['Order'].findOne.mockResolvedValue(packedOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(packedOrder)
        .mockResolvedValueOnce({ ...packedOrder, status: 'PARTIAL_DISPATCH' });
      managerRepos['OrderItem'].find.mockResolvedValue([
        {
          id: 'i1',
          product_id: 'p1',
          reserved_quantity: 5,
          dispatched_quantity: 0,
        },
      ]);
      managerRepos['DistributorInventory'].findOne.mockResolvedValue({
        available_quantity: 10,
        reserved_quantity: 5,
      });

      await service.partialDispatchOrder('u1', 'o1', {
        items: [{ orderItemId: 'i1', dispatchQuantity: 2 }],
      });

      expect(managerRepos['OrderItem'].update).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({
          dispatched_quantity: 2,
          status: 'PARTIAL_DISPATCH',
        }),
      );
      expect(managerRepos['Backorder'].save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3, status: 'OPEN' }),
      );
    });

    it('partialDeliverOrder: should deliver partially', async () => {
      const partialDispatchedOrder = {
        ...createdOrder,
        status: 'PARTIAL_DISPATCH',
      };
      managerRepos['Order'].findOne.mockResolvedValue(partialDispatchedOrder);
      mockOrderRepo.findOne
        .mockResolvedValueOnce(partialDispatchedOrder)
        .mockResolvedValueOnce({
          ...partialDispatchedOrder,
          status: 'PARTIAL_DELIVERY',
        });
      managerRepos['OrderItem'].find.mockResolvedValue([
        {
          id: 'i1',
          product_id: 'p1',
          reserved_quantity: 5,
          dispatched_quantity: 2,
          delivered_quantity: 0,
        },
      ]);

      await service.partialDeliverOrder('u1', 'o1', {
        items: [{ orderItemId: 'i1', deliverQuantity: 1 }],
      });

      expect(managerRepos['OrderItem'].update).toHaveBeenCalledWith(
        'i1',
        expect.objectContaining({
          delivered_quantity: 1,
          status: 'PARTIAL_DELIVERY',
        }),
      );
    });
  });
});
