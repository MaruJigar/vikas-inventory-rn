import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { BackordersService } from '../src/inventory/backorders.service';
import { BackordersController } from '../src/inventory/backorders.controller';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('BackordersController (e2e)', () => {
  let app: INestApplication;

  const mockBackordersService = {
    listBackorders: jest.fn().mockResolvedValue([{ id: 'b1' }]),
    getBackorder: jest.fn().mockResolvedValue({ id: 'b1' }),
    allocateBackorder: jest.fn().mockResolvedValue({ id: 'b1', status: 'PARTIALLY_ALLOCATED', resolved_quantity: 4 }),
  };

  let mockUser = { userId: 'distributor-1', role: 'DISTRIBUTOR_ADMIN' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BackordersController],
      providers: [
        { provide: BackordersService, useValue: mockBackordersService },
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

  it('/backorders (GET) - Allowed for DISTRIBUTOR_ADMIN', () => {
    mockUser = { userId: 'distributor-1', role: 'DISTRIBUTOR_ADMIN' };
    return request(app.getHttpServer())
      .get('/backorders?status=OPEN')
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toEqual([{ id: 'b1' }]);
        expect(mockBackordersService.listBackorders).toHaveBeenCalledWith('DISTRIBUTOR_ADMIN', 'distributor-1', { status: 'OPEN' });
      });
  });

  it('/backorders/:id (GET) - Forbidden for SALESMAN', () => {
    mockUser = { userId: 'salesman-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .get('/backorders/b1')
      .expect(403);
  });

  it('/backorders/:id/allocate (POST) - Allowed for DISTRIBUTOR_ADMIN', () => {
    mockUser = { userId: 'distributor-1', role: 'DISTRIBUTOR_ADMIN' };
    return request(app.getHttpServer())
      .post('/backorders/b1/allocate')
      .send({ allocateQuantity: 4 })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.id).toEqual('b1');
        expect(mockBackordersService.allocateBackorder).toHaveBeenCalledWith('b1', 4, 'distributor-1');
      });
  });

  it('/backorders/:id/allocate (POST) - Forbidden for MANUFACTURER_ADMIN', () => {
    mockUser = { userId: 'manufacturer-1', role: 'MANUFACTURER_ADMIN' };
    return request(app.getHttpServer())
      .post('/backorders/b1/allocate')
      .send({ allocateQuantity: 4 })
      .expect(403);
  });
});
