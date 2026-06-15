import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalService } from './approval.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalLog } from './approval-log.entity';
import { User } from '../user/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { DataSource } from 'typeorm';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';

describe('ApprovalService', () => {
  let service: ApprovalService;
  let mockReqRepo: any;
  let mockLogRepo: any;
  let mockUserRepo: any;
  let mockAuditLogService: any;
  let mockSocketGateway: any;
  let mockDataSource: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockReqRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
    mockLogRepo = { create: jest.fn(), save: jest.fn() };
    mockUserRepo = { findOne: jest.fn() };
    mockAuditLogService = { logAction: jest.fn() };
    mockSocketGateway = { broadcastToRoom: jest.fn() };
    mockNotificationService = { createNotification: jest.fn() };

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === Manufacturer)
          return {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 'mfg-1', user_id: 'user-mfg' }),
          };
        if (entity === Distributor)
          return {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 'dist-1', user_id: 'user-dist' }),
          };
        return { findOne: jest.fn() };
      }),
      createQueryRunner: jest.fn().mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          findOne: jest.fn((entity, options) => {
            if (entity === ApprovalRequest) {
              if (options.where.id === 'req-1')
                return Promise.resolve({
                  id: 'req-1',
                  status: 'PENDING_APPROVAL',
                  manufacturer_id: 'mfg-1',
                });
              if (options.where.id === 'req-2')
                return Promise.resolve({
                  id: 'req-2',
                  status: 'PENDING_APPROVAL',
                  manufacturer_id: 'mfg-other',
                });
              return Promise.resolve(null);
            }
            if (entity === Manufacturer)
              return Promise.resolve({ id: 'mfg-1', user_id: 'user-mfg' });
            if (entity === Distributor)
              return Promise.resolve({ id: 'dist-1', user_id: 'user-dist' });
            return Promise.resolve(null);
          }),
          save: jest.fn(),
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalService,
        { provide: getRepositoryToken(ApprovalRequest), useValue: mockReqRepo },
        { provide: getRepositoryToken(ApprovalLog), useValue: mockLogRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: AppSocketGateway, useValue: mockSocketGateway },
        {
          provide: require('../notification/notification.service')
            .NotificationService,
          useValue: mockNotificationService,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ApprovalService>(ApprovalService);
  });

  describe('reviewRequest', () => {
    it('should throw ForbiddenException if MANUFACTURER_ADMIN tries to approve request for different ecosystem', async () => {
      const user = { userId: 'user-mfg', role: 'MANUFACTURER_ADMIN' };
      // req-2 belongs to mfg-other
      await expect(
        service.reviewRequest('req-2', user, 'APPROVED'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully approve if MANUFACTURER_ADMIN owns the ecosystem', async () => {
      const user = { userId: 'user-mfg', role: 'MANUFACTURER_ADMIN' };
      // req-1 belongs to mfg-1
      const result = await service.reviewRequest('req-1', user, 'APPROVED');
      expect(result.message).toEqual('Request APPROVED successfully');
      expect(mockAuditLogService.logAction).toHaveBeenCalledWith(
        'APPROVAL_REQUEST_APPROVED',
        'APPROVAL',
        'req-1',
        'user-mfg',
        expect.any(Object),
      );
      expect(mockSocketGateway.broadcastToRoom).toHaveBeenCalledWith(
        'manufacturer:mfg-1',
        'APPROVAL_STATUS_CHANGED',
        { requestId: 'req-1', status: 'APPROVED' },
      );
    });

    it('should throw BadRequestException if invalid status is passed', async () => {
      const user = { userId: 'user-mfg', role: 'MANUFACTURER_ADMIN' };
      await expect(
        service.reviewRequest('req-1', user, 'RANDOM_STATUS'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
