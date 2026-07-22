import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApprovalRequest } from './approval-request.entity';
import { ApprovalLog } from './approval-log.entity';
import { User } from '../user/user.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Shop } from '../shop/shop.entity';
import { NotificationQueueService } from '../notification/notification-queue.service';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private reqRepo: Repository<ApprovalRequest>,
    @InjectRepository(ApprovalLog) private logRepo: Repository<ApprovalLog>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    private auditLogService: AuditLogService,
    private socketGateway: AppSocketGateway,
    private notificationQueueService: NotificationQueueService,
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

  async reviewRequest(
    requestId: string,
    currentUser: { userId: string; role: string },
    status: string,
    reason?: string,
  ) {
    if (status !== 'APPROVED' && status !== 'REJECTED')
      throw new BadRequestException('Invalid status');
    if (status === 'REJECTED' && !reason)
      throw new BadRequestException('Rejection reason is required');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(ApprovalRequest, {
        where: { id: requestId },
      });
      if (!request) throw new NotFoundException('Approval request not found');
      if (request.status !== 'PENDING_APPROVAL')
        throw new BadRequestException('Request is already processed');

      // Ecosystem Ownership Verification
      if (currentUser.role === 'MANUFACTURER_ADMIN') {
        const mfg = await queryRunner.manager.findOne(Manufacturer, {
          where: { user_id: currentUser.userId },
        });
        if (!mfg) {
          throw new ForbiddenException(
            'You do not have permission to approve this request',
          );
        }

        let hasAccess = request.manufacturer_id === mfg.id;

        if (!hasAccess && request.distributor_id) {
          const link = await queryRunner.manager.findOne('manufacturer_distributors', {
            where: {
              manufacturer_id: mfg.id,
              distributor_id: request.distributor_id,
            },
          });
          if (link) {
            hasAccess = true;
          }
        }

        if (!hasAccess) {
          throw new ForbiddenException(
            'You do not have permission to approve this request',
          );
        }
      } else if (currentUser.role === 'DISTRIBUTOR_ADMIN') {
        const dist = await queryRunner.manager.findOne(Distributor, {
          where: { user_id: currentUser.userId },
        });
        if (!dist || request.distributor_id !== dist.id) {
          throw new ForbiddenException(
            'You do not have permission to approve this request',
          );
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
        const user = await queryRunner.manager.findOne(User, {
          where: { id: request.requester_user_id },
        });
        if (user) {
          user.approval_status = status;
          await queryRunner.manager.save(user);
        }
      }

      // Sync Salesman entity
      if (request.salesman_id) {
        const salesman = await queryRunner.manager.findOne(Salesman, {
          where: { id: request.salesman_id },
        });
        if (salesman) {
          salesman.approval_status = status;
          salesman.is_active = status === 'APPROVED';
          salesman.approved_by_user_id = currentUser.userId;
          salesman.approved_at = new Date();
          if (reason) salesman.rejected_reason = reason;
          await queryRunner.manager.save(salesman);
        }
      }

      // Sync Distributor entity
      if (
        request.distributor_id &&
        request.request_type === 'DISTRIBUTOR_APPROVAL'
      ) {
        const distributor = await queryRunner.manager.findOne(Distributor, {
          where: { id: request.distributor_id },
        });
        if (distributor) {
          distributor.approval_status = status;
          distributor.is_active = status === 'APPROVED';
          distributor.approved_by_user_id = currentUser.userId;
          distributor.approved_at = new Date();
          if (reason) distributor.rejected_reason = reason;
          await queryRunner.manager.save(distributor);
        }
      }

      // Sync Manufacturer entity
      if (
        request.manufacturer_id &&
        request.request_type === 'MANUFACTURER_APPROVAL'
      ) {
        const manufacturer = await queryRunner.manager.findOne(Manufacturer, {
          where: { id: request.manufacturer_id },
        });
        if (manufacturer) {
          manufacturer.is_active = status === 'APPROVED';
          await queryRunner.manager.save(manufacturer);
        }
      }

      // Sync Shop entity
      if (
        request.shop_id &&
        request.request_type === 'SHOP_APPROVAL'
      ) {
        const shop = await queryRunner.manager.findOne(Shop, {
          where: { id: request.shop_id },
        });
        if (shop) {
          shop.verification_status = status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
          shop.is_active = status === 'APPROVED';
          await queryRunner.manager.save(shop);
        }
      }


      await queryRunner.commitTransaction();

      // Post Transaction: Audit Logs & Socket
      const auditAction =
        status === 'APPROVED'
          ? 'APPROVAL_REQUEST_APPROVED'
          : 'APPROVAL_REQUEST_REJECTED';
      await this.auditLogService.logAction(
        auditAction,
        'APPROVAL',
        request.id,
        currentUser.userId,
        {
          request_type: request.request_type,
          reason,
        },
      );

      if (request.manufacturer_id) {
        this.socketGateway.broadcastToRoom(
          `manufacturer:${request.manufacturer_id}`,
          'APPROVAL_STATUS_CHANGED',
          { requestId: request.id, status },
        );
      }

      if (request.requester_user_id) {
        let notifType = 'REQUEST_APPROVED';
        let rolePrefix = 'USER';
        let entityName = 'Entity';
        if (request.request_type === 'SALESMAN_APPROVAL')
          rolePrefix = 'SALESMAN';
        else if (request.request_type === 'DISTRIBUTOR_APPROVAL')
          rolePrefix = 'DISTRIBUTOR';
        else if (request.request_type === 'MANUFACTURER_APPROVAL')
          rolePrefix = 'MANUFACTURER';
        else if (request.request_type === 'SHOP_APPROVAL')
          rolePrefix = 'SHOP';
        else if (request.request_type === 'LINK_REQUEST')
          rolePrefix = 'LINK_REQUEST';

        notifType =
          status === 'APPROVED'
            ? `${rolePrefix}_APPROVED`
            : `${rolePrefix}_REJECTED`;

        // Enqueue notification safely out-of-band
        await this.notificationQueueService.enqueueNotification(
          request.requester_user_id,
          rolePrefix,
          `Request ${status}`,
          `Your ${request.request_type} request was ${status}. ${reason || ''}`,
          notifType,
          'APPROVAL_REQUEST',
          request.id,
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

  async getApprovalById(id: string, currentUser: { userId: string; role: string }) {
    const qb = this.reqRepo.createQueryBuilder('req')
      .where('req.id = :id', { id });

    if (currentUser.role === 'MANUFACTURER_ADMIN') {
      const mfg = await this.dataSource.getRepository(Manufacturer).findOne({ where: { user_id: currentUser.userId } });
      if (!mfg) throw new ForbiddenException('Manufacturer not found');
      qb.andWhere('req.manufacturer_id = :mfgId', { mfgId: mfg.id });
      qb.andWhere('req.request_type = :reqType', { reqType: 'DISTRIBUTOR_APPROVAL' });
    } else if (currentUser.role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource.getRepository(Distributor).findOne({ where: { user_id: currentUser.userId } });
      if (!dist) throw new ForbiddenException('Distributor not found');
      qb.andWhere('req.distributor_id = :distId', { distId: dist.id });
      qb.andWhere('req.request_type IN (:...reqTypes)', { reqTypes: ['SALESMAN_APPROVAL', 'SHOP_APPROVAL'] });
    } else if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Unauthorized role');
    }

    const request = await qb.getOne();
    if (!request) throw new NotFoundException('Approval request not found');

    const logs = await this.logRepo.find({
      where: { approval_request_id: request.id },
      order: { created_at: 'DESC' },
    });

    const logsWithUsers = await Promise.all(logs.map(async log => {
      let userName = 'System';
      if (log.acted_by_user_id) {
        const user = await this.userRepo.findOne({ where: { id: log.acted_by_user_id }, select: { full_name: true }});
        if (user) userName = user.full_name;
      }
      return { ...log, acted_by_user_name: userName };
    }));

    let entityInfo: any = null;
    if (request.request_type === 'DISTRIBUTOR_APPROVAL' && request.distributor_id) {
       entityInfo = await this.dataSource.getRepository(Distributor).findOne({ where: { id: request.distributor_id } });
    } else if (request.request_type === 'SALESMAN_APPROVAL' && request.salesman_id) {
       entityInfo = await this.dataSource.getRepository(Salesman).findOne({ where: { id: request.salesman_id } });
    } else if (request.request_type === 'MANUFACTURER_APPROVAL' && request.manufacturer_id) {
       entityInfo = await this.dataSource.getRepository(Manufacturer).findOne({ where: { id: request.manufacturer_id } });
    } else if (request.request_type === 'SHOP_APPROVAL' && request.metadata?.shop_id) {
       entityInfo = await this.dataSource.getRepository(Shop).findOne({ where: { id: request.metadata.shop_id } });
    }

    let requester: any = null;
    if (request.requester_user_id) {
       requester = await this.userRepo.findOne({ where: { id: request.requester_user_id }, select: { id: true, full_name: true, email: true, phone: true }});
    }

    return {
      request,
      logs: logsWithUsers,
      entity: entityInfo,
      requester,
    };
  }

  async getPendingRequests(
    currentUser: { userId: string; role: string },
    queryDto: ListQueryDto = {} as any,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      startDate,
      endDate,
      status = 'PENDING_APPROVAL',
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.reqRepo.createQueryBuilder('req')
      .leftJoin(User, 'user', 'user.id = req.requester_user_id');

    if (currentUser.role === 'SUPER_ADMIN') {
      // Global
    } else if (currentUser.role === 'MANUFACTURER_ADMIN') {
      const mfg = await this.dataSource
        .getRepository(Manufacturer)
        .findOne({ where: { user_id: currentUser.userId } });
      if (!mfg) throw new ForbiddenException('Manufacturer not found');
      qb.andWhere('req.manufacturer_id = :mfgId', { mfgId: mfg.id });
      qb.andWhere('req.request_type = :reqType', { reqType: 'DISTRIBUTOR_APPROVAL' });
    } else if (currentUser.role === 'DISTRIBUTOR_ADMIN') {
      const dist = await this.dataSource
        .getRepository(Distributor)
        .findOne({ where: { user_id: currentUser.userId } });
      if (!dist) throw new ForbiddenException('Distributor not found');
      qb.andWhere('req.distributor_id = :distId', { distId: dist.id });
      qb.andWhere('req.request_type IN (:...reqTypes)', { reqTypes: ['SALESMAN_APPROVAL', 'SHOP_APPROVAL'] });
    } else {
      throw new ForbiddenException('Unauthorized role');
    }

    if (status) {
      qb.andWhere('req.status = :status', { status });
    }

    if (search) {
      qb.andWhere('(req.request_type ILIKE :search OR user.full_name ILIKE :search)', { search: `%${search}%` });
    }

    if (startDate)
      qb.andWhere('req.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('req.created_at <= :endDate', { endDate: new Date(endDate) });

    const allowedSortFields = [
      'created_at',
      'updated_at',
      'status',
      'request_type',
    ];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`req.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('req.created_at', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const enhancedData = await Promise.all(
      data.map(async (item) => {
        const raw = { ...item } as any;

        if (item.requester_user_id) {
          const user = await this.userRepo.findOne({
            where: { id: item.requester_user_id },
            select: { full_name: true },
          });
          raw.requester_name = user?.full_name || null;
        }

        if (item.salesman_id) {
          const salesman = await this.dataSource
            .getRepository(Salesman)
            .findOne({
              where: { id: item.salesman_id },
              select: { full_name: true },
            });
          raw.salesman_name = salesman?.full_name || null;
        }

        if (item.distributor_id) {
          const dist = await this.dataSource
            .getRepository(Distributor)
            .findOne({
              where: { id: item.distributor_id },
              select: { business_name: true },
            });
          raw.distributor_name = dist?.business_name || null;
        }

        if (item.manufacturer_id) {
          const mfg = await this.dataSource
            .getRepository(Manufacturer)
            .findOne({
              where: { id: item.manufacturer_id },
              select: { company_name: true },
            });
          raw.manufacturer_name = mfg?.company_name || null;
        }

        if (item.shop_id) {
          const shop = await this.dataSource
            .getRepository(Shop)
            .findOne({
              where: { id: item.shop_id },
              select: { name: true },
            });
          raw.shop_name = shop?.name || null;
        }

        return raw;
      }),
    );

    return {
      data: enhancedData,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
