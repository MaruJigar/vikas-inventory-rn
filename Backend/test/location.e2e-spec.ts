import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { JwtService, JwtModule } from '@nestjs/jwt';
import { LocationController } from '../src/location/location.controller';
import { LocationService } from '../src/location/location.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('LocationController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let salesmanToken: string;
  let distributorToken: string;
  let mfrToken: string;

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
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            uploadLocation: jest.fn().mockResolvedValue({ id: 'loc1' }),
            batchUploadLocations: jest
              .fn()
              .mockResolvedValue({ synced_count: 1 }),
            getLiveLocation: jest
              .fn()
              .mockImplementation((userId, role, salesmanId) => {
                if (role === 'MANUFACTURER_ADMIN' && salesmanId === 's2') {
                  const { ForbiddenException } = require('@nestjs/common');
                  throw new ForbiddenException();
                }
                return Promise.resolve({});
              }),
            getLocationHistory: jest.fn().mockResolvedValue([]),
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
    mfrToken = jwtService.sign({
      sub: 'mfr1',
      userId: 'mfr1',
      role: 'MANUFACTURER_ADMIN',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /locations - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/locations')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({
        latitude: 10,
        longitude: 20,
        captured_at: new Date().toISOString(),
      })
      .expect(201);
  });

  it('POST /locations - Forbidden for Distributor', () => {
    return request(app.getHttpServer())
      .post('/locations')
      .set('Authorization', `Bearer ${distributorToken}`)
      .send({
        latitude: 10,
        longitude: 20,
        captured_at: new Date().toISOString(),
      })
      .expect(403);
  });

  it('POST /locations/batch - Allowed for Salesman', () => {
    return request(app.getHttpServer())
      .post('/locations/batch')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .send({
        locations: [
          {
            latitude: 10,
            longitude: 20,
            captured_at: new Date().toISOString(),
          },
        ],
      })
      .expect(201);
  });

  it('GET /locations/salesmen/:id/live - Allowed for Distributor', () => {
    return request(app.getHttpServer())
      .get('/locations/salesmen/s1/live')
      .set('Authorization', `Bearer ${distributorToken}`)
      .expect(200);
  });

  it('GET /locations/salesmen/:id/history - Allowed for Manufacturer', () => {
    return request(app.getHttpServer())
      .get('/locations/salesmen/s1/history')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(200);
  });

  it('GET /locations/salesmen/:id/live - Forbidden for Manufacturer accessing unlinked Distributor', () => {
    // In our mock, if they access a salesman where they aren't linked, our mocked service could throw
    // But since the service is mocked simply via `jest.fn()`, we need to simulate the ForbiddenException
    // Wait, the e2e test uses a mocked LocationService. Let's update the mock to reject if mfrToken but salesman is 's2' (unlinked).
    return request(app.getHttpServer())
      .get('/locations/salesmen/s2/live')
      .set('Authorization', `Bearer ${mfrToken}`)
      .expect(403);
  });

  it('GET /locations/salesmen/:id/history - Forbidden for Salesman', () => {
    return request(app.getHttpServer())
      .get('/locations/salesmen/s1/history')
      .set('Authorization', `Bearer ${salesmanToken}`)
      .expect(403);
  });
});
