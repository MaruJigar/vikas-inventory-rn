import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalLog } from './approval-log.entity';
import { User } from '../user/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalRequest) private reqRepo: Repository<ApprovalRequest>,
    @InjectRepository(ApprovalLog) private logRepo: Repository<ApprovalLog>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway,
    private notificationService: NotificationService,
  ) {}

  async createRequest(type: string, requesterId: string, metadata: any) {
    const request = this.reqRepo.create({
      request_type: type,
      requester_user_id: requesterId,
      status: 'PENDING_APPROVAL',
      metadata,
    });
    return this.reqRepo.save(request);
  }

  async reviewRequest(requestId: string, currentUser: { userId: string, role: string }, status: string, reason?: string) {
    if (status !== 'APPROVED' && status !== 'REJECTED') throw new BadRequestException('Invalid status');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(ApprovalRequest, { where: { id: requestId } });
      if (!request) throw new NotFoundException('Approval request not found');
      if (request.status !== 'PENDING_APPROVAL') throw new BadRequestException('Request is already processed');

      // Ecosystem Ownership Verification
      if (currentUser.role === 'MANUFACTURER_ADMIN') {
        const mfg = await queryRunner.manager.findOne(Manufacturer, { where: { user_id: currentUser.userId } });
        if (!mfg || request.manufacturer_id !== mfg.id) {
          throw new ForbiddenException('You do not have permission to approve this request');
        }
      } else if (currentUser.role === 'DISTRIBUTOR_ADMIN') {
        const dist = await queryRunner.manager.findOne(Distributor, { where: { user_id: currentUser.userId } });
        if (!dist || request.distributor_id !== dist.id) {
          throw new ForbiddenException('You do not have permission to approve this request');
        }
      } else if (currentUser.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Unauthorized role');
      }

      request.status = status;
      request.reviewed_by_user_id = currentUser.userId;
      request.reviewed_at = new Date();
      if (reason) request.rejection_reason = reason;
      await queryRunner.manager.save(request);

      const log = this.logRepo.create({
        approval_request_id: request.id,
        action: 'REVIEW',
        old_status: 'PENDING_APPROVAL',
        new_status: status,
        acted_by_user_id: currentUser.userId,
        reason,
      });
      await queryRunner.manager.save(log);

      if (request.requester_user_id) {
        const user = await queryRunner.manager.findOne(User, { where: { id: request.requester_user_id } });
        if (user) {
          user.approval_status = status;
          await queryRunner.manager.save(user);
        }
      }

      await queryRunner.commitTransaction();

      // Post Transaction: Audit Logs & Socket
      const auditAction = status === 'APPROVED' ? 'APPROVAL_REQUEST_APPROVED' : 'APPROVAL_REQUEST_REJECTED';
      await this.auditLogService.logAction(auditAction, 'APPROVAL', request.id, currentUser.userId, {
        request_type: request.request_type,
        reason,
      });
      
      if (request.manufacturer_id) {
        this.socketGateway.broadcastToRoom(`manufacturer:${request.manufacturer_id}`, 'APPROVAL_STATUS_CHANGED', { requestId: request.id, status });
      }

      if (request.requester_user_id) {
        let notifType = 'REQUEST_APPROVED';
        let rolePrefix = 'USER';
        if (request.request_type === 'SALESMAN_REGISTRATION') rolePrefix = 'SALESMAN';
        else if (request.request_type === 'DISTRIBUTOR_REGISTRATION') rolePrefix = 'DISTRIBUTOR';
        else if (request.request_type === 'MANUFACTURER_REGISTRATION') rolePrefix = 'MANUFACTURER';
        else if (request.request_type === 'LINK_REQUEST') rolePrefix = 'LINK_REQUEST';
        
        notifType = status === 'APPROVED' ? `${rolePrefix}_APPROVED` : `${rolePrefix}_REJECTED`;
        
        await this.notificationService.createNotification(
          request.requester_user_id,
          rolePrefix,
          `Request ${status}`,
          `Your ${request.request_type} request was ${status}. ${reason || ''}`,
          notifType,
          'APPROVAL_REQUEST',
          request.id
        );
      }

      return { message: `Request ${status} successfully` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPendingRequests(currentUser: { userId: string, role: string }) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return this.reqRepo.find({ where: { status: 'PENDING_APPROVAL' } });
    } else if (currentUser.role === 'MANUFACTURER_ADMIN') {
      const mfg = await this.dataSource.getRepository(Manufacturer).findOne({ where: { user_id: currentUser.userId } });
      if (!mfg) return [];
      return this.reqRepo.find({ where: { status: 'PENDING_APPROVAL', manufacturer_id: mfg.id } });
    } else if (currentUser.role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource.getRepository(Distributor).findOne({ where: { user_id: currentUser.userId } });
      if (!dist) return [];
      return this.reqRepo.find({ where: { status: 'PENDING_APPROVAL', distributor_id: dist.id } });
    }
    return [];
  }
}
