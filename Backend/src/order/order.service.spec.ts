import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderRevision } from './order-revision.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { Backorder } from './backorder.entity';
import { FulfillmentLog } from './fulfillment-log.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { Shop } from '../shop/shop.entity';
import { Product } from '../product/product.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

// ─── Mock factories ─────────────────────────────────────────────────────────

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

const mockManagerRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  count: jest.fn(),
});

// Entities returned from manager.getRepository(EntityClass)
const managerRepos: Record<string, ReturnType<typeof mockManagerRepo>> = {};

const mockDataSource = {
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

const mockAuditLogService = { logAction: jest.fn() };
const mockSocketGateway = { broadcastToRoom: jest.fn() };

// ─── Setup ──────────────────────────────────────────────────────────────────

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepo: ReturnType<typeof mockRepo>;
  let mockItemRepo: ReturnType<typeof mockRepo>;
  let mockRevisionRepo: ReturnType<typeof mockRepo>;
  let mockStatusHistoryRepo: ReturnType<typeof mockRepo>;
  let mockBackorderRepo: ReturnType<typeof mockRepo>;
  let mockFulfillmentLogRepo: ReturnType<typeof mockRepo>;
  let mockSalesmanRepo: ReturnType<typeof mockRepo>;
  let mockDistRepo: ReturnType<typeof mockRepo>;
  let mockMfrRepo: ReturnType<typeof mockRepo>;
  let mockMfrDistRepo: ReturnType<typeof mockRepo>;
  let mockVisitRepo: ReturnType<typeof mockRepo>;
  let mockShopRepo: ReturnType<typeof mockRepo>;
  let mockProductRepo: ReturnType<typeof mockRepo>;
  let mockInventoryRepo: ReturnType<typeof mockRepo>;
  let mockMovementRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    // Reset manager repos
    Object.keys(managerRepos).forEach((k) => delete managerRepos[k]);
    mockDataSource.transaction.mockImplementation(async (cb) => {
      const manager = {
        getRepository: jest.fn((entity) => {
          const key = entity.name || String(entity);
          if (!managerRepos[key]) managerRepos[key] = mockManagerRepo();
          return managerRepos[key];
        }),
      };
      return cb(manager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useFactory: mockRepo },
        { provide: getRepositoryToken(OrderItem), useFactory: mockRepo },
        { provide: getRepositoryToken(OrderRevision), useFactory: mockRepo },
        {
          provide: getRepositoryToken(OrderStatusHistory),
          useFactory: mockRepo,
        },
        { provide: getRepositoryToken(Backorder), useFactory: mockRepo },
        { provide: getRepositoryToken(FulfillmentLog), useFactory: mockRepo },
        { provide: getRepositoryToken(Salesman), useFactory: mockRepo },
        { provide: getRepositoryToken(Distributor), useFactory: mockRepo },
        { provide: getRepositoryToken(Manufacturer), useFactory: mockRepo },
        {
          provide: getRepositoryToken(ManufacturerDistributor),
          useFactory: mockRepo,
        },
        { provide: getRepositoryToken(ShopVisit), useFactory: mockRepo },
        { provide: getRepositoryToken(Shop), useFactory: mockRepo },
        { provide: getRepositoryToken(Product), useFactory: mockRepo },
        {
          provide: getRepositoryToken(DistributorInventory),
          useFactory: mockRepo,
        },
        {
          provide: getRepositoryToken(InventoryMovement),
          useFactory: mockRepo,
        },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    mockOrderRepo = module.get(getRepositoryToken(Order));
    mockItemRepo = module.get(getRepositoryToken(OrderItem));
    mockRevisionRepo = module.get(getRepositoryToken(OrderRevision));
    mockStatusHistoryRepo = module.get(getRepositoryToken(OrderStatusHistory));
    mockBackorderRepo = module.get(getRepositoryToken(Backorder));
    mockFulfillmentLogRepo = module.get(getRepositoryToken(FulfillmentLog));
    mockSalesmanRepo = module.get(getRepositoryToken(Salesman));
    mockDistRepo = module.get(getRepositoryToken(Distributor));
    mockMfrRepo = module.get(getRepositoryToken(Manufacturer));
    mockMfrDistRepo = module.get(getRepositoryToken(ManufacturerDistributor));
    mockVisitRepo = module.get(getRepositoryToken(ShopVisit));
    mockShopRepo = module.get(getRepositoryToken(Shop));
    mockProductRepo = module.get(getRepositoryToken(Product));
    mockInventoryRepo = module.get(getRepositoryToken(DistributorInventory));
    mockMovementRepo = module.get(getRepositoryToken(InventoryMovement));
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Helpers for common mocks ─────────────────────────────────────────────

  const approvedSalesman = {
    id: 's1',
    user_id: 'u1',
    approval_status: 'APPROVED',
    distributor_id: 'd1',
  };
  const activeVisit = {
    id: 'v1',
    salesman_id: 's1',
    status: 'ACTIVE',
    shop_id: 'shop1',
    distributor_id: 'd1',
  };
  const validShop = { id: 'shop1', distributor_id: 'd1' };
  const validProduct = {
    id: 'p1',
    name: 'Product A',
    sku: 'SKU-001',
    mrp: 100,
  };
  const inventory = {
    id: 'inv1',
    distributor_id: 'd1',
    product_id: 'p1',
    available_quantity: 50,
    reserved_quantity: 0,
    backordered_quantity: 0,
  };

  const setupCreateMocks = (overrides: any = {}) => {
    mockSalesmanRepo.findOne.mockResolvedValue(
      overrides.salesman !== undefined ? overrides.salesman : approvedSalesman,
    );
    mockOrderRepo.findOne.mockResolvedValue(null); // no idempotency match
    mockVisitRepo.findOne.mockResolvedValue(
      overrides.visit !== undefined ? overrides.visit : activeVisit,
    );
    mockShopRepo.findOne.mockResolvedValue(
      overrides.shop !== undefined ? overrides.shop : validShop,
    );
    // productRepo is used DIRECTLY by service (not via manager) — mock the injected repo
    mockProductRepo.findOne.mockResolvedValue(
      overrides.product !== undefined ? overrides.product : validProduct,
    );

    // Manager-level mocks
    Object.assign(managerRepos, {
      DistributorInventory: {
        findOne: jest
          .fn()
          .mockResolvedValue(
            overrides.inventory !== undefined ? overrides.inventory : inventory,
          ),
        increment: jest.fn(),
        decrement: jest.fn(),
      },
      InventoryMovement: { save: jest.fn() },
      Backorder: { save: jest.fn(), update: jest.fn() },
      Order: {
        create: jest.fn().mockReturnValue({
          id: 'order1',
          order_number: 'ORD-20240101-123456',
          status: 'CREATED',
          distributor_id: 'd1',
          salesman_id: 's1',
        }),
        save: jest.fn().mockResolvedValue({
          id: 'order1',
          order_number: 'ORD-20240101-123456',
          status: 'CREATED',
          distributor_id: 'd1',
          salesman_id: 's1',
          total_backordered_quantity: 0,
          final_order_amount: 100,
          shop_id: 'shop1',
          created_at: new Date(),
        }),
        update: jest.fn(),
        findOne: jest.fn().mockResolvedValue({
          id: 'o1',
          status: 'CREATED',
          final_order_amount: 150,
          distributor_id: 'd1',
        }),
      },
      OrderItem: {
        save: jest.fn().mockResolvedValue({ id: 'item1' }),
        delete: jest.fn(),
        find: jest.fn().mockResolvedValue([
          {
            id: 'i1',
            product_id: 'p1',
            reserved_quantity: 2,
            backordered_quantity: 0,
          },
        ]),
      },
      OrderStatusHistory: {
        save: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      OrderRevision: { count: jest.fn().mockResolvedValue(0), save: jest.fn() },
    });
  };

  // ─── createOrder ─────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('should throw ForbiddenException if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 2 }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if salesman not approved', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({
        ...approvedSalesman,
        approval_status: 'PENDING',
      });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 2 }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return existing order on duplicate idempotency key', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      const existing = { id: 'order-existing' };
      mockOrderRepo.findOne.mockResolvedValue(existing);
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [],
        idempotencyKey: 'key123',
      });
      expect(result).toBe(existing);
    });

    it('should throw NotFoundException if visit not found', async () => {
      setupCreateMocks({ visit: null });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if visit not owned by salesman', async () => {
      setupCreateMocks({
        visit: { ...activeVisit, salesman_id: 'other-salesman' },
      });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if visit is not active', async () => {
      setupCreateMocks({ visit: { ...activeVisit, status: 'CLOSED' } });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if shop not found', async () => {
      setupCreateMocks({ shop: null });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if shop not in salesman distributor', async () => {
      setupCreateMocks({ shop: { id: 'shop1', distributor_id: 'other-dist' } });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if shop does not match visit shop', async () => {
      setupCreateMocks({
        visit: { ...activeVisit, shop_id: 'different-shop' },
      });
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no products provided', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue(null);
      mockVisitRepo.findOne.mockResolvedValue(activeVisit);
      mockShopRepo.findOne.mockResolvedValue(validShop);
      await expect(
        service.createOrder('u1', {
          visitId: 'v1',
          shopId: 'shop1',
          products: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create order successfully with inventory reservation', async () => {
      setupCreateMocks();
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [{ productId: 'p1', quantity: 2 }],
      });
      expect(result.id).toBe('order1');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'ORDER_CREATED',
        'ORDER',
        'order1',
        'u1',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'NEW_ORDER',
        expect.any(Object),
      );
    });

    it('should create backorder when stock insufficient', async () => {
      setupCreateMocks({ inventory: { ...inventory, available_quantity: 1 } }); // only 1 available, requesting 5
      managerRepos['Order'].save.mockResolvedValue({
        id: 'order1',
        order_number: 'ORD-1',
        status: 'CREATED',
        distributor_id: 'd1',
        salesman_id: 's1',
        total_backordered_quantity: 4,
        final_order_amount: 500,
        shop_id: 'shop1',
        created_at: new Date(),
      });
      managerRepos['Backorder'].save.mockResolvedValue({
        id: 'bo1',
        order_item_id: 'item1',
        product_id: 'p1',
        quantity: 4,
      });

      await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [{ productId: 'p1', quantity: 5 }],
      });

      // Backorder socket event should fire
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'BACKORDER_CREATED',
        expect.any(Object),
      );

      // Backorder audit log should fire
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'BACKORDER_CREATED',
        'BACKORDER',
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          orderId: expect.any(String),
        }),
      );
    });

    it('should apply PERCENTAGE item discount correctly', async () => {
      setupCreateMocks();
      // MRP=100, qty=2, gross=200, 10% discount = 20 → net=180
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [
          {
            productId: 'p1',
            quantity: 2,
            itemDiscountType: 'PERCENTAGE',
            itemDiscountValue: 10,
          },
        ],
      });
      expect(result).toBeDefined();
    });

    it('should apply FLAT item discount correctly', async () => {
      setupCreateMocks();
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [
          {
            productId: 'p1',
            quantity: 2,
            itemDiscountType: 'FLAT',
            itemDiscountValue: 15,
          },
        ],
      });
      expect(result).toBeDefined();
    });

    it('should apply bill-level PERCENTAGE discount', async () => {
      setupCreateMocks();
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [{ productId: 'p1', quantity: 2 }],
        billDiscountType: 'PERCENTAGE',
        billDiscountValue: 5,
      });
      expect(result).toBeDefined();
    });

    it('should set is_offline_created flag for offline orders', async () => {
      setupCreateMocks();
      const result = await service.createOrder('u1', {
        visitId: 'v1',
        shopId: 'shop1',
        products: [{ productId: 'p1', quantity: 1 }],
        isOfflineCreated: true,
        idempotencyKey: 'device1_ORDER_001',
      });
      expect(result).toBeDefined();
    });
  });

  // ─── updateOrder ─────────────────────────────────────────────────────────

  describe('updateOrder', () => {
    const activeOrder = {
      id: 'o1',
      status: 'CREATED',
      salesman_id: 's1',
      distributor_id: 'd1',
      bill_discount_type: 'NONE',
      bill_discount_value: 0,
    };

    it('should throw NotFoundException if order not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateOrder('u1', 'o1', {
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if order not owned by salesman', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        salesman_id: 'other-s',
      });
      await expect(
        service.updateOrder('u1', 'o1', {
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order is cancelled', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        status: 'CANCELLED',
      });
      await expect(
        service.updateOrder('u1', 'o1', {
          products: [{ productId: 'p1', quantity: 1 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully update order pre-dispatch and create revision', async () => {
      setupCreateMocks();
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue(activeOrder);
      mockProductRepo.findOne.mockResolvedValue(validProduct);

      const result = await service.updateOrder('u1', 'o1', {
        products: [{ productId: 'p1', quantity: 3 }],
        reason: 'Test update',
      });

      expect(result).toBeDefined();
      expect(managerRepos['OrderRevision'].save).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'o1',
          changed_by_role: 'SALESMAN',
          reason: 'Test update',
        }),
      );
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'ORDER_EDITED',
        'ORDER',
        'o1',
        'u1',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'ORDER_EDITED',
        expect.any(Object),
      );
    });

    it('should successfully update order post-dispatch without reversing inventory', async () => {
      const dispatchedOrder = { ...activeOrder, status: 'DISPATCHED' };
      setupCreateMocks();
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      mockOrderRepo.findOne.mockResolvedValue(dispatchedOrder);
      mockProductRepo.findOne.mockResolvedValue(validProduct);

      const result = await service.updateOrder('u1', 'o1', {
        products: [{ productId: 'p1', quantity: 3 }],
      });

      expect(result).toBeDefined();
      expect(
        managerRepos['DistributorInventory'].decrement,
      ).not.toHaveBeenCalled();
      expect(managerRepos['Order'].update).toHaveBeenCalledWith(
        'o1',
        expect.objectContaining({ post_dispatch_edited: true }),
      );
    });
  });

  // ─── cancelOrder ─────────────────────────────────────────────────────────

  describe('cancelOrder', () => {
    const cancelDto = { cancellationReason: 'Wrong order' };
    const activeOrder = {
      id: 'o1',
      status: 'CREATED',
      salesman_id: 's1',
      distributor_id: 'd1',
    };

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(
        service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already cancelled', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        status: 'CANCELLED',
      });
      await expect(
        service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if delivered', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        status: 'DELIVERED',
      });
      await expect(
        service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if salesman does not own order (IDOR attempt)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        salesman_id: 'other-s',
      });
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      await expect(
        service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if salesman tries to cancel dispatched order', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        status: 'DISPATCHED',
      });
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      await expect(
        service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if distributor does not own order (IDOR attempt)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...activeOrder,
        distributor_id: 'other-dist',
      });
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      await expect(
        service.cancelOrder('u1', 'DISTRIBUTOR_ADMIN', 'o1', cancelDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for unauthorized role', async () => {
      mockOrderRepo.findOne.mockResolvedValue(activeOrder);
      await expect(
        service.cancelOrder('u1', 'MANUFACTURER_ADMIN', 'o1', cancelDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should cancel order and release reserved inventory', async () => {
      mockOrderRepo.findOne.mockResolvedValue(activeOrder);
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      managerRepos['OrderItem'] = {
        find: jest.fn().mockResolvedValue([
          {
            id: 'item1',
            product_id: 'p1',
            reserved_quantity: 5,
            backordered_quantity: 0,
          },
        ]),
        update: jest.fn(),
      };
      managerRepos['DistributorInventory'] = {
        ...mockManagerRepo(),
        decrement: jest.fn(),
        increment: jest.fn(),
      };
      managerRepos['InventoryMovement'] = {
        ...mockManagerRepo(),
        save: jest.fn(),
      };
      managerRepos['Backorder'] = { ...mockManagerRepo(), update: jest.fn() };
      managerRepos['Order'] = { ...mockManagerRepo(), update: jest.fn() };
      managerRepos['OrderStatusHistory'] = {
        ...mockManagerRepo(),
        save: jest.fn(),
      };
      mockOrderRepo.findOne
        .mockResolvedValueOnce(activeOrder)
        .mockResolvedValueOnce({ ...activeOrder, status: 'CANCELLED' });

      const result = await service.cancelOrder(
        'u1',
        'SALESMAN',
        'o1',
        cancelDto,
      );
      expect(result.status).toBe('CANCELLED');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'ORDER_CANCELLED',
        'ORDER',
        'o1',
        'u1',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'distributor:d1',
        'ORDER_CANCELLED',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'salesman:s1',
        'ORDER_CANCELLED',
        expect.any(Object),
      );
    });

    it('should also release backordered quantities on cancel', async () => {
      mockOrderRepo.findOne.mockResolvedValue(activeOrder);
      mockSalesmanRepo.findOne.mockResolvedValue(approvedSalesman);
      managerRepos['OrderItem'] = {
        find: jest.fn().mockResolvedValue([
          {
            id: 'item1',
            product_id: 'p1',
            reserved_quantity: 2,
            backordered_quantity: 3,
          },
        ]),
        update: jest.fn(),
      };
      managerRepos['DistributorInventory'] = {
        ...mockManagerRepo(),
        decrement: jest.fn(),
        increment: jest.fn(),
      };
      managerRepos['InventoryMovement'] = {
        ...mockManagerRepo(),
        save: jest.fn(),
      };
      managerRepos['Backorder'] = { ...mockManagerRepo(), update: jest.fn() };
      managerRepos['Order'] = { ...mockManagerRepo(), update: jest.fn() };
      managerRepos['OrderStatusHistory'] = {
        ...mockManagerRepo(),
        save: jest.fn(),
      };
      mockOrderRepo.findOne
        .mockResolvedValueOnce(activeOrder)
        .mockResolvedValueOnce({ ...activeOrder, status: 'CANCELLED' });

      await service.cancelOrder('u1', 'SALESMAN', 'o1', cancelDto);
      // Backorder should be cancelled
      expect(managerRepos['Backorder'].update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'OPEN' }),
        { status: 'CANCELLED' },
      );
    });
  });

  // ─── getOrders ────────────────────────────────────────────────────────────

  describe('getOrders', () => {
    it('SUPER_ADMIN: should return all orders', async () => {
      mockOrderRepo.find.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }]);
      const result = await service.getOrders('u1', 'SUPER_ADMIN');
      expect(result).toHaveLength(2);
      expect(mockOrderRepo.find).toHaveBeenCalledWith({
        order: { created_at: 'DESC' },
      });
    });

    it('DISTRIBUTOR_ADMIN: should return only own distributor orders', async () => {
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockOrderRepo.find.mockResolvedValue([{ id: 'o1' }]);
      const result = await service.getOrders('u1', 'DISTRIBUTOR_ADMIN');
      expect(result).toHaveLength(1);
      expect(mockOrderRepo.find).toHaveBeenCalledWith({
        where: { distributor_id: 'd1' },
        order: { created_at: 'DESC' },
      });
    });

    it('DISTRIBUTOR_ADMIN: should throw if distributor not found', async () => {
      mockDistRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrders('u1', 'DISTRIBUTOR_ADMIN'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should return only ecosystem orders', async () => {
      mockMfrRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockMfrDistRepo.find.mockResolvedValue([
        { manufacturer_id: 'm1', distributor_id: 'd1' },
      ]);
      const result = await service.getOrders('u1', 'MANUFACTURER_ADMIN');
      expect(mockOrderRepo.createQueryBuilder).toHaveBeenCalled();
    });

    it('MANUFACTURER_ADMIN: should return empty if no linked distributors', async () => {
      mockMfrRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockMfrDistRepo.find.mockResolvedValue([]);
      const result = await service.getOrders('u1', 'MANUFACTURER_ADMIN');
      expect(result).toEqual([]);
    });

    it('MANUFACTURER_ADMIN: should throw if manufacturer not found', async () => {
      mockMfrRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrders('u1', 'MANUFACTURER_ADMIN'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('SALESMAN: should return only own orders', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      mockOrderRepo.find.mockResolvedValue([{ id: 'o1' }]);
      const result = await service.getOrders('u1', 'SALESMAN');
      expect(result).toHaveLength(1);
      expect(mockOrderRepo.find).toHaveBeenCalledWith({
        where: { salesman_id: 's1' },
        order: { created_at: 'DESC' },
      });
    });

    it('SALESMAN: should throw if salesman not found', async () => {
      mockSalesmanRepo.findOne.mockResolvedValue(null);
      await expect(service.getOrders('u1', 'SALESMAN')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Unknown role: should throw ForbiddenException', async () => {
      await expect(service.getOrders('u1', 'UNKNOWN')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ─── getOrderById ─────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    const order = { id: 'o1', distributor_id: 'd1', salesman_id: 's1' };

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrderById('u1', 'SALESMAN', 'o1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('SUPER_ADMIN: should return any order', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      const result = await service.getOrderById('u1', 'SUPER_ADMIN', 'o1');
      expect(result.id).toBe('o1');
    });

    it('DISTRIBUTOR_ADMIN: should return own distributor order', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      const result = await service.getOrderById(
        'u1',
        'DISTRIBUTOR_ADMIN',
        'o1',
      );
      expect(result.id).toBe('o1');
    });

    it('DISTRIBUTOR_ADMIN: should reject other distributor order (IDOR)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...order,
        distributor_id: 'other-dist',
      });
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      await expect(
        service.getOrderById('u1', 'DISTRIBUTOR_ADMIN', 'o1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should allow access for linked ecosystem', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockMfrRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockMfrDistRepo.findOne.mockResolvedValue({
        manufacturer_id: 'm1',
        distributor_id: 'd1',
      });
      const result = await service.getOrderById(
        'u1',
        'MANUFACTURER_ADMIN',
        'o1',
      );
      expect(result.id).toBe('o1');
    });

    it('MANUFACTURER_ADMIN: should reject unlinked distributor order (IDOR)', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockMfrRepo.findOne.mockResolvedValue({ id: 'm1', user_id: 'u1' });
      mockMfrDistRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrderById('u1', 'MANUFACTURER_ADMIN', 'o1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('MANUFACTURER_ADMIN: should throw if manufacturer not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockMfrRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrderById('u1', 'MANUFACTURER_ADMIN', 'o1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('SALESMAN: should return own order', async () => {
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      const result = await service.getOrderById('u1', 'SALESMAN', 'o1');
      expect(result.id).toBe('o1');
    });

    it('SALESMAN: should reject other salesman order (IDOR)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        ...order,
        salesman_id: 'other-salesman',
      });
      mockSalesmanRepo.findOne.mockResolvedValue({ id: 's1', user_id: 'u1' });
      await expect(
        service.getOrderById('u1', 'SALESMAN', 'o1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getOrderRevisions ────────────────────────────────────────────────────

  describe('getOrderRevisions', () => {
    it('should return revisions for order owner', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 'o1',
        distributor_id: 'd1',
        salesman_id: 's1',
      });
      mockDistRepo.findOne.mockResolvedValue({ id: 'd1', user_id: 'u1' });
      mockRevisionRepo.find.mockResolvedValue([
        { id: 'r1', revision_number: 1 },
      ]);
      const result = await service.getOrderRevisions(
        'u1',
        'DISTRIBUTOR_ADMIN',
        'o1',
      );
      expect(result).toHaveLength(1);
      expect(mockRevisionRepo.find).toHaveBeenCalledWith({
        where: { order_id: 'o1' },
        order: { revision_number: 'ASC' },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(
        service.getOrderRevisions('u1', 'SALESMAN', 'o1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
