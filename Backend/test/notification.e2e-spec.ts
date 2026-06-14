import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { NotificationService } from '../src/notification/notification.service';
import { NotificationController } from '../src/notification/notification.controller';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { RolesGuard } from '../src/role-permission/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('NotificationController (e2e)', () => {
  let app: INestApplication;

  const mockService = {
    getNotifications: jest.fn().mockImplementation((userId) => {
      if (userId === 'user-1') return [{ id: 'n1', recipient_user_id: 'user-1' }];
      return [];
    }),
    getUnreadCount: jest.fn().mockResolvedValue({ unread_count: 5 }),
    markAsRead: jest.fn().mockResolvedValue({ id: 'n1', is_read: true }),
    markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
    deleteNotification: jest.fn().mockResolvedValue({ success: true }),
  };

  let mockUser = { userId: 'user-1', role: 'SALESMAN' };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useValue: mockService },
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

  it('/notifications (GET)', () => {
    mockUser = { userId: 'user-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .get('/notifications')
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toEqual([{ id: 'n1', recipient_user_id: 'user-1' }]);
      });
  });

  it('/notifications/unread-count (GET)', () => {
    mockUser = { userId: 'user-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .get('/notifications/unread-count')
      .expect(200)
      .expect({ unread_count: 5 });
  });

  it('/notifications/read-all (PATCH)', () => {
    mockUser = { userId: 'user-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .patch('/notifications/read-all')
      .expect(200)
      .expect({ success: true });
  });

  it('/notifications/:id/read (PATCH)', () => {
    mockUser = { userId: 'user-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .patch('/notifications/n1/read')
      .expect(200)
      .expect({ id: 'n1', is_read: true });
  });

  it('/notifications/:id (DELETE)', () => {
    mockUser = { userId: 'user-1', role: 'SALESMAN' };
    return request(app.getHttpServer())
      .delete('/notifications/n1')
      .expect(200)
      .expect({ success: true });
  });
});
