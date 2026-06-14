import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { JwtService, JwtModule } from '@nestjs/jwt';
import { WorkingDayController } from '../src/working-day/working-day.controller';
import { WorkingDayService } from '../src/working-day/working-day.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('WorkingDayController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let salesmanToken: string;
  let distributorToken: string;

  beforeAll(async () => {
    // Create a mock auth guard that respects the token role
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
      }
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [WorkingDayController],
      providers: [
        { 
          provide: WorkingDayService, 
          useValue: { 
            checkIn: jest.fn().mockResolvedValue({ id: 'wd1' }),
            checkOut: jest.fn().mockResolvedValue({ id: 'wd1' }),
            getHistory: jest.fn().mockResolvedValue([])
          } 
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
    salesmanToken = jwtService.sign({ sub: 'u1', userId: 'u1', role: 'SALESMAN' });
    distributorToken = jwtService.sign({ sub: 'du1', userId: 'du1', role: 'DISTRIBUTOR_ADMIN' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /working-day/check-in - Unauthorized (No Token)', () => {
    return request(app.getHttpServer())
      .post('/working-day/check-in')
      .send({ latitude: 10, longitude: 20 })
      .expect(403); // Since the guard returns false
  });

  it('POST /working-day/check-in - Forbidden (Wrong Role)', () => {
    return request(app.getHttpServer())
      .post('/working-day/check-in')
      .set('Authorization', `Bearer ${distributorToken}`)
      .send({ latitude: 10, longitude: 20 })
      .expect(403);
  });

  it('POST /working-day/check-out - Forbidden (Wrong Role)', () => {
    return request(app.getHttpServer())
      .post('/working-day/check-out')
      .set('Authorization', `Bearer ${distributorToken}`)
      .send({ latitude: 10, longitude: 20 })
      .expect(403);
  });

  it('GET /working-day/history - Allowed for Distributor', () => {
    return request(app.getHttpServer())
      .get('/working-day/history')
      .set('Authorization', `Bearer ${distributorToken}`)
      .expect(200);
  });
});
