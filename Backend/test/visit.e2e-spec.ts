import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { VisitService } from '../src/visit/visit.service';
import { VisitController } from '../src/visit/visit.controller';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('VisitController (e2e)', () => {
  let app: INestApplication;

  const salesmanToken = 'mock-salesman-jwt';
  const distToken = 'mock-dist-jwt';
  const mfrToken = 'mock-mfr-jwt';
  const otherSalesmanToken = 'mock-other-salesman-jwt';
  const otherDistToken = 'mock-other-dist-jwt';

  const mockVisitService = {
    startVisit: jest.fn().mockResolvedValue({ id: 'v1' }),
    endVisit: jest.fn().mockResolvedValue({ id: 'v1', status: 'CLOSED' }),
    noOrderVisit: jest.fn().mockResolvedValue({ id: 'v1', status: 'CLOSED' }),
    getVisits: jest.fn().mockResolvedValue([{ id: 'v1' }]),
    getVisitById: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [VisitController],
      providers: [VisitService],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          const auth = req.headers['authorization'];
          if (auth === `Bearer ${salesmanToken}`) {
            req.user = { userId: 'salesman1', role: 'SALESMAN' };
            return true;
          }
          if (auth === `Bearer ${otherSalesmanToken}`) {
            req.user = { userId: 'salesman2', role: 'SALESMAN' };
            return true;
          }
          if (auth === `Bearer ${distToken}`) {
            req.user = { userId: 'dist1', role: 'DISTRIBUTOR_ADMIN' };
            return true;
          }
          if (auth === `Bearer ${otherDistToken}`) {
            req.user = { userId: 'dist2', role: 'DISTRIBUTOR_ADMIN' };
            return true;
          }
          if (auth === `Bearer ${mfrToken}`) {
            req.user = { userId: 'mfr1', role: 'MANUFACTURER_ADMIN' };
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
          const requiredRoles = Reflect.getMetadata('roles', context.getHandler());
          if (!requiredRoles) return true;
          return requiredRoles.includes(role);
        },
      })
      .overrideProvider(VisitService)
      .useValue(mockVisitService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: service works normally
    mockVisitService.startVisit.mockResolvedValue({ id: 'v1' });
    mockVisitService.endVisit.mockResolvedValue({ id: 'v1', status: 'CLOSED' });
    mockVisitService.noOrderVisit.mockResolvedValue({ id: 'v1', status: 'CLOSED' });
    mockVisitService.getVisits.mockResolvedValue([{ id: 'v1' }]);
    mockVisitService.getVisitById.mockResolvedValue({ id: 'v1' });
  });

  // ─── Role-level access control ─────────────────────────────────────────────

  it('POST /visits/start - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/visits/start')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ shopId: 'shop1' })
      .expect(201);
  });

  it('POST /visits/start - Forbidden for Distributor Admin', () => {
    return request(app.getHttpServer())
      .post('/visits/start')
      .set('Authorization', `Bearer ${distToken}`)
      .send({ shopId: 'shop1' })
      .expect(403);
  });

  it('POST /visits/start - Forbidden for Manufacturer Admin', () => {
    return request(app.getHttpServer())
      .post('/visits/start')
      .set('Authorization', `Bearer ${mfrToken}`)
      .send({ shopId: 'shop1' })
      .expect(403);
  });

  it('POST /visits/start - Rejected without auth', () => {
    return request(app.getHttpServer())
      .post('/visits/start')
      .send({ shopId: 'shop1' })
      .expect(403);
  });

  it('POST /visits/end - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/visits/end')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ visitId: 'v1' })
      .expect(201);
  });

  it('POST /visits/no-order - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/visits/no-order')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({ visitId: 'v1', reason: 'CLOSED_SHOP' })
      .expect(201);
  });

  // ─── Ownership enforcement ──────────────────────────────────────────────────

  it('GET /visits - Returns visits for Distributor', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(200)
      .expect((res) => {
        expect(mockVisitService.getVisits).toHaveBeenCalledWith('dist1', 'DISTRIBUTOR_ADMIN');
      });
  });

  it('GET /visits - Returns visits for Manufacturer', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(200)
      .expect(() => {
        expect(mockVisitService.getVisits).toHaveBeenCalledWith('mfr1', 'MANUFACTURER_ADMIN');
      });
  });

  it('GET /visits - Returns only own visits for Salesman', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .expect(200)
      .expect(() => {
        expect(mockVisitService.getVisits).toHaveBeenCalledWith('salesman1', 'SALESMAN');
      });
  });

  // ─── GET /visits/:id ownership enforcement ──────────────────────────────────

  it('GET /visits/:id - Allowed for owner Salesman', () => {
    mockVisitService.getVisitById.mockResolvedValue({ id: 'v1', salesman_id: 'salesman1' });
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .expect(200);
  });

  it('GET /visits/:id - Forbidden for different Salesman (IDOR)', () => {
    mockVisitService.getVisitById.mockRejectedValue(new ForbiddenException('Not your visit'));
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${otherSalesmanToken}`)
      .expect(403);
  });

  it('GET /visits/:id - Allowed for Distributor owning the visit', () => {
    mockVisitService.getVisitById.mockResolvedValue({ id: 'v1', distributor_id: 'dist1' });
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(200);
  });

  it('GET /visits/:id - Forbidden for Distributor accessing another distributor visit (IDOR)', () => {
    mockVisitService.getVisitById.mockRejectedValue(new ForbiddenException('Not your visit'));
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${otherDistToken}`)
      .expect(403);
  });

  it('GET /visits/:id - Allowed for Manufacturer with linked distributor', () => {
    mockVisitService.getVisitById.mockResolvedValue({ id: 'v1', distributor_id: 'dist1' });
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(200);
  });

  it('GET /visits/:id - Forbidden for Manufacturer accessing unlinked distributor visit (IDOR)', () => {
    mockVisitService.getVisitById.mockRejectedValue(new ForbiddenException('Not in your ecosystem'));
    return request(app.getHttpServer())
      .get('/visits/v1')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(403);
  });

  it('GET /visits/:id - 404 when visit not found', () => {
    mockVisitService.getVisitById.mockRejectedValue(new NotFoundException('Visit not found'));
    return request(app.getHttpServer())
      .get('/visits/nonexistent')
      .set('Authorization', `Bearer ${distToken}`)
      .expect(404);
  });
});
