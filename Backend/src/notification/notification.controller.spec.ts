import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';

describe('NotificationController', () => {
  let controller: NotificationController;

  const mockService = {
    getNotifications: jest.fn().mockResolvedValue([{ id: 'n1' }]),
    getUnreadCount: jest.fn().mockResolvedValue({ unread_count: 5 }),
    markAsRead: jest.fn().mockResolvedValue({ id: 'n1', is_read: true }),
    markAllAsRead: jest.fn().mockResolvedValue({ success: true }),
    deleteNotification: jest.fn().mockResolvedValue({ success: true }),
  };

  const mockReq = { user: { userId: 'u1', role: 'SALESMAN' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('getNotifications', async () => {
    expect(await controller.getNotifications(mockReq)).toEqual([{ id: 'n1' }]);
  });

  it('getUnreadCount', async () => {
    expect(await controller.getUnreadCount(mockReq)).toEqual({
      unread_count: 5,
    });
  });

  it('markAsRead', async () => {
    expect(await controller.markAsRead('n1', mockReq)).toEqual({
      id: 'n1',
      is_read: true,
    });
  });

  it('markAllAsRead', async () => {
    expect(await controller.markAllAsRead(mockReq)).toEqual({ success: true });
  });

  it('deleteNotification', async () => {
    expect(await controller.deleteNotification('n1', mockReq)).toEqual({
      success: true,
    });
  });
});
