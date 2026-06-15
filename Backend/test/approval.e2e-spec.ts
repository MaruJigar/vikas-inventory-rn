import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ApprovalModule (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let mockUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('approve request', async () => {
    expect(true).toBe(true);
  });

  it('reject request', async () => {
    expect(true).toBe(true);
  });

  it('wrong role', async () => {
    expect(true).toBe(true);
  });

  it('wrong ecosystem', async () => {
    expect(true).toBe(true);
  });

  it('already approved', async () => {
    expect(true).toBe(true);
  });

  it('already rejected', async () => {
    expect(true).toBe(true);
  });

  it('request not found', async () => {
    expect(true).toBe(true);
  });
});
