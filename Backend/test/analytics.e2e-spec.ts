import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AnalyticsService } from '../src/analytics/analytics.service';
import { AnalyticsController } from '../src/analytics/analytics.controller';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;

  const mockService = {
    getDashboard: jest.fn().mockResolvedValue({ status: 'ok' }),
    getWorkingDayAnalytics: jest.fn().mockResolvedValue({ sales: true }),
    getVisitsAnalytics: jest.fn().mockResolvedValue({ visits: true }),
    getOrdersAnalytics: jest.fn().mockResolvedValue({ orders: true }),
    getInventoryAnalytics: jest.fn().mockResolvedValue({ inventory: true }),
    getBackordersAnalytics: jest.fn().mockResolvedValue({ backorders: true }),
    getFulfillmentAnalytics: jest.fn().mockResolvedValue({ fulfillment: true }),
    getApprovalsAnalytics: jest.fn().mockResolvedValue({ approvals: true }),
  };

  let mockUser = { userId: 'dist-1', role: 'DISTRIBUTOR_ADMIN' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          const roles = Reflect.getMetadata('roles', context.getHandler());
          if (!roles) return true;
          return roles.includes(mockUser.role);
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/analytics/dashboard (GET)', () => {
    mockUser = { userId: 'dist-1', role: 'DISTRIBUTOR_ADMIN' };
    return request(app.getHttpServer())
      .get('/analytics/dashboard')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/analytics/inventory (GET) - Forbidden for SALESMAN', () => {
    mockUser = { userId: 'sales-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .get('/analytics/inventory')
      .expect(403);
  });
});
