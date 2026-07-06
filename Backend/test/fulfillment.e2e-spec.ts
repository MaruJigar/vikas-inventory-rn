import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { FulfillmentService } from '../src/fulfillment/fulfillment.service';
import { FulfillmentController } from '../src/fulfillment/fulfillment.controller';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FulfillmentController (e2e)', () => {
  let app: INestApplication;

  const mockFulfillmentService = {
    confirmOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'CONFIRMED' }),
    processingOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'PROCESSING' }),
    packOrder: jest.fn().mockResolvedValue({ id: 'o1', status: 'PACKED' }),
    dispatchOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'DISPATCHED' }),
    deliverOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'DELIVERED' }),
    partialDispatchOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'PARTIAL_DISPATCH' }),
    partialDeliverOrder: jest
      .fn()
      .mockResolvedValue({ id: 'o1', status: 'PARTIAL_DELIVER' }),
  };

  const mockAuthGuard = { canActivate: jest.fn(() => true) };
  let mockUser = { userId: 'distributor-1', role: 'DISTRIBUTOR_ADMIN' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FulfillmentController],
      providers: [
        { provide: FulfillmentService, useValue: mockFulfillmentService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
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

  it('/orders/:id/confirm (PATCH) - Allowed for DISTRIBUTOR_ADMIN', () => {
    mockUser = { userId: 'distributor-1', role: 'DISTRIBUTOR_ADMIN' };
    return request(app.getHttpServer())
      .patch('/orders/o1/confirm')
      .send({ notes: 'Confirming' })
      .expect(200)
      .expect((res: any) => {
        expect(res.body.id).toEqual('o1');
        expect(mockFulfillmentService.confirmOrder).toHaveBeenCalledWith(
          'distributor-1',
          'o1',
          { notes: 'Confirming' },
        );
      });
  });

  it('/orders/:id/confirm (PATCH) - Forbidden for SALESMAN', () => {
    mockUser = { userId: 'salesman-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .patch('/orders/o1/confirm')
      .send({ notes: 'Confirming' })
      .expect(403);
  });
});
