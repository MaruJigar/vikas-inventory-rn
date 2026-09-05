import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { DistributorInventory } from '../inventory/distributor-inventory.entity';
import { Backorder } from '../order/backorder.entity';
import { ApprovalRequest } from '../approval/approval-request.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Notification } from '../notification/notification.entity';
import { InventoryMovement } from '../inventory/inventory-movement.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({
      total_active: '5',
      checked_in_today: '3',
      checked_out_today: '2',
      avg_hours: '8.5',
      total_visits: '10',
      active_visits: '2',
      completed_visits: '8',
      no_order_visits: '1',
      total: '20',
      orders_today: '5',
      orders_month: '15',
      value_today: '500',
      value_month: '1500',
      avg_value: '100',
      cancelled_orders: '1',
      pending_dispatch: '4',
      dispatched: '2',
      delivered: '1',
      partial: '1',
      low_stock: '3',
      backordered_products: '2',
      open_backorders: '2',
      resolved_backorders: '5',
      backorder_value: '200',
      pending: '3',
      approved_today: '2',
      rejected_today: '1',
      adjustments: '10',
    }),
  };

  const mockRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    count: jest.fn().mockResolvedValue(7),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(Order), useValue: mockRepo },
        { provide: getRepositoryToken(ShopVisit), useValue: mockRepo },
        {
          provide: getRepositoryToken(DistributorInventory),
          useValue: mockRepo,
        },
        { provide: getRepositoryToken(Backorder), useValue: mockRepo },
        { provide: getRepositoryToken(ApprovalRequest), useValue: mockRepo },
        { provide: getRepositoryToken(WorkingDay), useValue: mockRepo },
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
        { provide: getRepositoryToken(InventoryMovement), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('getDashboard - should return aggregated dashboard for DISTRIBUTOR_ADMIN', async () => {
    const res = await service.getDashboard('DISTRIBUTOR_ADMIN', 'user-1');
    expect(res).toBeDefined();
    expect(res.workingDay.activeSalesmen).toEqual(5);
    expect(res.visits.totalVisits).toEqual(10);
    expect(res.orders.ordersToday).toEqual(5);
    expect(res.fulfillment.ordersPendingDispatch).toEqual(4);
    expect(res.inventory.lowStockProducts).toEqual(3);
    expect(res.backorders.openBackorders).toEqual(2);
    expect(res.approvals.pendingApprovals).toEqual(3);
    expect(res.notifications.unreadNotifications).toEqual(7);
  });

  it('getWorkingDayAnalytics - SALESMAN', async () => {
    mockQueryBuilder.andWhere.mockClear();
    const res = await service.getWorkingDayAnalytics('SALESMAN', 'user-1');
    expect(res.activeSalesmen).toEqual(5);
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining(
        'wd.salesman_id IN (SELECT s.id FROM salesmen s WHERE s.user_id = :userId)',
      ),
      { userId: 'user-1' },
    );
  });

  it('getVisitsAnalytics - DISTRIBUTOR_ADMIN', async () => {
    const res = await service.getVisitsAnalytics('DISTRIBUTOR_ADMIN', 'user-1');
    expect(res.completedVisits).toEqual(8);
  });

  it('getVisitsAnalytics - empty', async () => {
    mockQueryBuilder.getRawOne.mockResolvedValueOnce(null);
    const res = await service.getVisitsAnalytics('DISTRIBUTOR_ADMIN', 'user-1');
    expect(res.completedVisits).toEqual(0);
    expect(res.visitConversionRate).toEqual(0);
  });

  it('getOrdersAnalytics - MANUFACTURER_ADMIN', async () => {
    mockQueryBuilder.andWhere.mockClear();
    await service.getOrdersAnalytics('MANUFACTURER_ADMIN', 'user-1');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('distributor_id IN'),
      { userId: 'user-1' },
    );
  });

  it('getApprovalsAnalytics - MANUFACTURER_ADMIN', async () => {
    mockQueryBuilder.andWhere.mockClear();
    await service.getApprovalsAnalytics('MANUFACTURER_ADMIN', 'user-1');
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('requester_user_id IN'),
      { userId: 'user-1' },
    );
  });
});
