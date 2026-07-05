import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { JwtService, JwtModule } from '@nestjs/jwt';
import { SalesmanController } from '../src/salesman/salesman.controller';
import { SalesmanService } from '../src/salesman/salesman.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('SalesmanController Status Update (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let salesmanToken: string;
  let distributorToken: string;
  let salesmanService: SalesmanService;

  beforeAll(async () => {
    const mockJwtGuard = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization;
        if (!auth) return false;
        try {
          const token = auth.replace('Bearer ', '');
          const jwt = new JwtService({ secret: 'test-secret' });
          req.user = jwt.verify(token);
          return true;
        } catch {
          return false;
        }
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [SalesmanController],
      providers: [
        {
          provide: SalesmanService,
          useValue: {
            updateSalesmanStatus: jest.fn().mockResolvedValue({
              message: 'Salesman status updated successfully',
            }),
          },
        },
        RolesGuard,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    salesmanService = moduleFixture.get<SalesmanService>(SalesmanService);

    salesmanToken = jwtService.sign({
      sub: 'u1',
      userId: 'u1',
      role: 'SALESMAN',
    });
    distributorToken = jwtService.sign({
      sub: 'du1',
      userId: 'du1',
      role: 'DISTRIBUTOR_ADMIN',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('PATCH /salesmen/:id/status - Allowed for Distributor Admin', async () => {
    const response = await request(app.getHttpServer())
      .patch('/salesmen/salesman-uuid/status')
      .set('Authorization', `Bearer ${distributorToken}`)
      .send({ is_active: false })
      .expect(200);

    expect(response.body).toEqual({
      message: 'Salesman status updated successfully',
    });
    expect(salesmanService.updateSalesmanStatus).toHaveBeenCalledWith(
      'salesman-uuid',
      { is_active: false },
      'DISTRIBUTOR_ADMIN',
      'du1',
    );
  });

  it('PATCH /salesmen/:id/status - Forbidden for Salesman', async () => {
    await request(app.getHttpServer())
      .patch('/salesmen/salesman-uuid/status')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ is_active: false })
      .expect(403);
  });
});
