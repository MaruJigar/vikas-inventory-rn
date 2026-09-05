import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderStatusService } from './order-status.service';
import { OrderStatusController } from './order-status.controller';
import { OrderStatus } from './order-status.entity';

describe('OrderStatusService & OrderStatusController', () => {
  let service: OrderStatusService;
  let controller: OrderStatusController;

  const mockOrderStatusRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderStatusController],
      providers: [
        OrderStatusService,
        {
          provide: getRepositoryToken(OrderStatus),
          useValue: mockOrderStatusRepo,
        },
      ],
    }).compile();

    service = module.get<OrderStatusService>(OrderStatusService);
    controller = module.get<OrderStatusController>(OrderStatusController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('findActiveStatuses', () => {
    it('should return active statuses ordered by sequence ASC with required fields', async () => {
      const mockActiveStatuses = [
        {
          id: 'status-1',
          name: 'Draft',
          sequence: 1,
          can_cancel_order: true,
          isactive: true,
          is_cancel_status: false,
          is_dispatch_status: false,
        },
        {
          id: 'status-2',
          name: 'Dispatched',
          sequence: 2,
          can_cancel_order: false,
          isactive: true,
          is_cancel_status: false,
          is_dispatch_status: true,
        },
      ];

      mockOrderStatusRepo.find.mockResolvedValue(mockActiveStatuses);

      const result = await service.findActiveStatuses();

      expect(mockOrderStatusRepo.find).toHaveBeenCalledWith({
        where: {
          isactive: true,
        },
        select: {
          id: true,
          name: true,
          sequence: true,
          can_cancel_order: true,
          is_cancel_status: true,
          is_dispatch_status: true,
        },
        order: {
          sequence: 'ASC',
        },
      });

      expect(result).toEqual([
        {
          id: 'status-1',
          name: 'Draft',
          sequence: 1,
          can_cancel_order: true,
          is_cancel_status: false,
          is_dispatch_status: false,
        },
        {
          id: 'status-2',
          name: 'Dispatched',
          sequence: 2,
          can_cancel_order: false,
          is_cancel_status: false,
          is_dispatch_status: true,
        },
      ]);
    });

    it('controller findActiveStatuses should delegate to service.findActiveStatuses', async () => {
      const mockResult = [
        {
          id: 'status-1',
          name: 'Draft',
          sequence: 1,
          can_cancel_order: true,
          is_cancel_status: false,
          is_dispatch_status: false,
        },
      ];

      jest.spyOn(service, 'findActiveStatuses').mockResolvedValue(mockResult);

      const res = await controller.findActiveStatuses();
      expect(res).toBe(mockResult);
      expect(service.findActiveStatuses).toHaveBeenCalled();
    });
  });
});
