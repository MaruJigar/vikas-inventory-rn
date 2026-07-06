import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockNotifRepo = {
    create: jest.fn().mockImplementation((obj) => ({ id: 'n1', ...obj })),
    save: jest.fn().mockImplementation(async (obj) => obj),
    find: jest.fn().mockResolvedValue([{ id: 'n1' }]),
    count: jest.fn().mockResolvedValue(5),
    findOne: jest.fn().mockImplementation(async ({ where }) => {
      if (where.id === 'n1')
        return { id: 'n1', recipient_user_id: where.recipient_user_id };
      return null;
    }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    remove: jest.fn().mockResolvedValue({ id: 'n1' }),
  };

  const mockSocketGateway = { broadcastToRoom: jest.fn() };
  const mockAuditLogService = { logAction: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: mockNotifRepo },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('createNotification', async () => {
    const res = await service.createNotification(
      'u1',
      'SALESMAN',
      'Title',
      'Msg',
      'TYPE',
      'Entity',
      'e1',
    );
    expect(res.id).toEqual('n1');
    expect(mockAuditLogService.logAction).toHaveBeenCalled();
    expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
      'user:u1',
      'NOTIFICATION_CREATED',
      expect.any(Object),
    );
  });

  it('getNotifications', async () => {
    const res = await service.getNotifications('u1');
    expect(res).toEqual([{ id: 'n1' }]);
  });

  it('getUnreadCount', async () => {
    const res = await service.getUnreadCount('u1');
    expect(res).toEqual({ unread_count: 5 });
  });

  it('markAsRead', async () => {
    const res = await service.markAsRead('n1', 'u1');
    expect(res.is_read).toBe(true);
    expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
      'user:u1',
      'NOTIFICATION_READ',
      { id: 'n1' },
    );
  });

  it('markAsRead not found', async () => {
    await expect(service.markAsRead('n2', 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('markAllAsRead', async () => {
    const res = await service.markAllAsRead('u1');
    expect(res.success).toBe(true);
  });

  it('deleteNotification', async () => {
    const res = await service.deleteNotification('n1', 'u1');
    expect(res.success).toBe(true);
  });

  it('deleteNotification not found', async () => {
    await expect(service.deleteNotification('n2', 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
