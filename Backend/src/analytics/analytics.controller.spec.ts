import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  const mockService = {
    getDashboard: jest.fn().mockResolvedValue({}),
    getWorkingDayAnalytics: jest.fn().mockResolvedValue({}),
    getVisitsAnalytics: jest.fn().mockResolvedValue({}),
    getOrdersAnalytics: jest.fn().mockResolvedValue({}),
    getInventoryAnalytics: jest.fn().mockResolvedValue({}),
    getBackordersAnalytics: jest.fn().mockResolvedValue({}),
    getFulfillmentAnalytics: jest.fn().mockResolvedValue({}),
    getApprovalsAnalytics: jest.fn().mockResolvedValue({}),
  };

  const mockReq = { user: { userId: 'u1', role: 'SALESMAN' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('getDashboard', async () => {
    expect(await controller.getDashboard(mockReq)).toEqual({});
  });

  it('getSales', async () => {
    expect(await controller.getSales(mockReq)).toEqual({});
  });

  it('getVisits', async () => {
    expect(await controller.getVisits(mockReq)).toEqual({});
  });

  it('getOrders', async () => {
    expect(await controller.getOrders(mockReq)).toEqual({});
  });

  it('getInventory', async () => {
    expect(await controller.getInventory(mockReq)).toEqual({});
  });

  it('getBackorders', async () => {
    expect(await controller.getBackorders(mockReq)).toEqual({});
  });

  it('getFulfillment', async () => {
    expect(await controller.getFulfillment(mockReq)).toEqual({});
  });

  it('getApprovals', async () => {
    expect(await controller.getApprovals(mockReq)).toEqual({});
  });
});
