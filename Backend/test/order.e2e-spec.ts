import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { OrderService } from '../src/order/order.service';
import { OrdersController } from '../src/order/order.controller';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  const salesmanToken = 'mock-salesman-jwt';
  const distToken = 'mock-dist-jwt';
  const mfrToken = 'mock-mfr-jwt';
  const superAdminToken = 'mock-admin-jwt';
  const otherSalesmanToken = 'mock-other-salesman-jwt';
  const otherDistToken = 'mock-other-dist-jwt';

  const mockOrderService = {
    createOrder: jest.fn().mockResolvedValue({ id: 'o1', status: 'CREATED' }),
    getOrders: jest.fn().mockResolvedValue([{ id: 'o1' }]),
    getOrderById: jest.fn().mockResolvedValue({ id: 'o1' }),
    updateOrder: jest.fn().mockResolvedValue({ id: 'o1' }),
    cancelOrder: jest.fn().mockResolvedValue({ id: 'o1', status: 'CANCELLED' }),
    getOrderRevisions: jest.fn().mockResolvedValue([{ revision_number: 1 }]),
    confirmOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'CONFIRMED' }),
    processingOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'PROCESSING' }),
    packedOrder: jest.fn().mockResolvedValue({ id: 'o1', status: 'PACKED' }),
    dispatchOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'DISPATCHED' }),
    deliverOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'DELIVERED' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          const auth = req.headers['authorization'];
          const tokenMap: Record<string, any> = {
            [`Bearer ${salesmanToken}`]: { userId: 'u1', role: 'SALESMAN' },
            [`Bearer ${otherSalesmanToken}`]: {
              userId: 'u2',
              role: 'SALESMAN',
            },
            [`Bearer ${distToken}`]: {
              userId: 'u3',
              role: 'DISTRIBUTOR_ADMIN',
            },
            [`Bearer ${otherDistToken}`]: {
              userId: 'u4',
              role: 'DISTRIBUTOR_ADMIN',
            },
            [`Bearer ${mfrToken}`]: {
              userId: 'u5',
              role: 'MANUFACTURER_ADMIN',
            },
            [`Bearer ${superAdminToken}`]: {
              userId: 'u6',
              role: 'SUPER_ADMIN',
            },
          };
          if (tokenMap[auth]) {
            req.user = tokenMap[auth];
            return true;
          }
          return false;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          const role = req.user?.role;
          const requiredRoles = Reflect.getMetadata(
            'roles',
            context.getHandler(),
          );
          if (!requiredRoles) return true;
          return requiredRoles.includes(role);
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderService.createOrder.mockResolvedValue({
      id: 'o1',
      status: 'CREATED',
    });
    mockOrderService.getOrders.mockResolvedValue([{ id: 'o1' }]);
    mockOrderService.getOrderById.mockResolvedValue({ id: 'o1' });
    mockOrderService.cancelOrder.mockResolvedValue({
      id: 'o1',
      status: 'CANCELLED',
    });
    mockOrderService.confirmOrder.mockResolvedValue({
      id: 'o1',
      status: 'CONFIRMED',
    });
    mockOrderService.dispatchOrder.mockResolvedValue({
      id: 'o1',
      status: 'DISPATCHED',
    });
    mockOrderService.deliverOrder.mockResolvedValue({
      id: 'o1',
      status: 'DELIVERED',
    });
  });

  // ─── Role access control ──────────────────────────────────────────────────

  it('POST /orders - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ visitId: 'v1', shopId: 's1', products: [] })
      .expect(201);
  });

  it('POST /orders - Forbidden for Distributor Admin', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${distToken}`)
      .send({ visitId: 'v1', shopId: 's1', products: [] })
      .expect(403);
  });

  it('POST /orders - Forbidden for Manufacturer Admin', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${mfrToken}`)
      .send({ visitId: 'v1', shopId: 's1', products: [] })
      .expect(403);
  });

  it('POST /orders - Rejected without auth', () => {
    return request(app.getHttpServer()).post('/orders').send({}).expect(403);
  });

  // ─── 🛡️ Cancel – role-based 🛡️──────────────────────────────────────────────────

  it('PATCH /orders/:id/cancel - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .patch('/orders/o1/cancel')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ cancellationReason: 'Test' })
      .expect(200);
  });

  it('PATCH /orders/:id/cancel - Allowed for Distributor', () => {
    return request(app.getHttpServer())
      .patch('/orders/o1/cancel')
      .set('Authorization', `Bearer ${distToken}`)
      .send({ cancellationReason: 'Test' })
      .expect(200);
  });

  it('PATCH /orders/:id/cancel - Forbidden for Manufacturer', () => {
    return request(app.getHttpServer())
      .patch('/orders/o1/cancel')
      .set('Authorization', `Bearer ${mfrToken}`)
      .send({ cancellationReason: 'Test' })
      .expect(403);
  });

  // ─── Ownership enforcement via service mock ───────────────────────────────

  it('GET /orders/:id - Salesman IDOR rejected by service', () => {
    mockOrderService.getOrderById.mockRejectedValue(
      new ForbiddenException('Not your order'),
    );
    return request(app.getHttpServer())
      .get('/orders/o1')
      .set('Authorization', `Bearer ${otherSalesmanToken}`)
      .expect(403);
  });

  it('GET /orders/:id - Distributor IDOR rejected by service', () => {
    mockOrderService.getOrderById.mockRejectedValue(
      new ForbiddenException('Not your order'),
    );
    return request(app.getHttpServer())
      .get('/orders/o1')
      .set('Authorization', `Bearer ${otherDistToken}`)
      .expect(403);
  });

  it('GET /orders/:id - Manufacturer ecosystem IDOR rejected by service', () => {
    mockOrderService.getOrderById.mockRejectedValue(
      new ForbiddenException('Not in your ecosystem'),
    );
    return request(app.getHttpServer())
      .get('/orders/o1')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(403);
  });

  it('GET /orders/:id - 404 for nonexistent order', () => {
    mockOrderService.getOrderById.mockRejectedValue(
      new NotFoundException('Order not found'),
    );
    return request(app.getHttpServer())
      .get('/orders/nonexistent')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(404);
  });

  // ─── getOrders – role-scoped ──────────────────────────────────────────────

  it('GET /orders - Salesman gets own orders', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .expect(200)
      .expect(() => {
        expect(mockOrderService.getOrders).toHaveBeenCalledWith(
          'u1',
          'SALESMAN',
        );
      });
  });

  it('GET /orders - Distributor gets own distributor orders', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(200)
      .expect(() => {
        expect(mockOrderService.getOrders).toHaveBeenCalledWith(
          'u3',
          'DISTRIBUTOR_ADMIN',
        );
      });
  });

  it('GET /orders - Manufacturer gets ecosystem orders', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(200)
      .expect(() => {
        expect(mockOrderService.getOrders).toHaveBeenCalledWith(
          'u5',
          'MANUFACTURER_ADMIN',
        );
      });
  });

  // ─── Revisions ────────────────────────────────────────────────────────────

  it('GET /orders/:id/revisions - Returns revisions for authenticated users', () => {
    return request(app.getHttpServer())
      .get('/orders/o1/revisions')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(200);
  });

  it('GET /orders/:id/revisions - Rejects unauthenticated requests', () => {
    return request(app.getHttpServer()).get('/orders/o1/revisions').expect(403);
  });
});
