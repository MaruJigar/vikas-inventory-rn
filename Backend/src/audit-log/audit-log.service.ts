import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    entityType: string,
    entityId: string | null,
    actorId: string | null,
    metadata: any,
  ) {
    const log = this.auditLogRepo.create({
      action,
      entity_type: entityType,
      entity_id: entityId as any,
      actor_user_id: actorId as any,
      metadata,
    });
    return this.auditLogRepo.save(log);
  }

  async getAuditLogs(
    queryDto: AuditLogQueryDto = {} as any,
  ): Promise<PaginatedResponse<AuditLog>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      startDate,
      endDate,
      actor_user_id,
      action,
      entity_type,
      entity_id,
      ip_address,
    } = queryDto;

    const skip = (page - 1) * limit;
    const qb = this.auditLogRepo.createQueryBuilder('audit');

    if (actor_user_id) {
      qb.andWhere('audit.actor_user_id = :actor_user_id', { actor_user_id });
    }

    if (action) {
      qb.andWhere('audit.action ILIKE :action', { action: `%${action}%` });
    }

    if (entity_type) {
      qb.andWhere('audit.entity_type = :entity_type', { entity_type });
    }

    if (entity_id) {
      qb.andWhere('audit.entity_id = :entity_id', { entity_id });
    }

    if (ip_address) {
      qb.andWhere('audit.ip_address = :ip_address', { ip_address });
    }

    if (startDate) {
      qb.andWhere('audit.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('audit.created_at <= :endDate', { endDate });
    }

    if (search) {
      qb.andWhere(
        '(audit.action ILIKE :search OR audit.entity_type ILIKE :search OR audit.ip_address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = ['created_at', 'action', 'entity_type', 'actor_role'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`audit.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('audit.created_at', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
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

  async getAuditLogsForExport(queryDto: AuditLogQueryDto = {} as any): Promise<AuditLog[]> {
    const {
      search,
      startDate,
      endDate,
      actor_user_id,
      action,
      entity_type,
      entity_id,
      ip_address,
    } = queryDto;

    const qb = this.auditLogRepo.createQueryBuilder('audit');

    if (actor_user_id) qb.andWhere('audit.actor_user_id = :actor_user_id', { actor_user_id });
    if (action) qb.andWhere('audit.action ILIKE :action', { action: `%${action}%` });
    if (entity_type) qb.andWhere('audit.entity_type = :entity_type', { entity_type });
    if (entity_id) qb.andWhere('audit.entity_id = :entity_id', { entity_id });
    if (ip_address) qb.andWhere('audit.ip_address = :ip_address', { ip_address });
    if (startDate) qb.andWhere('audit.created_at >= :startDate', { startDate });
    if (endDate) qb.andWhere('audit.created_at <= :endDate', { endDate });
    if (search) {
      qb.andWhere(
        '(audit.action ILIKE :search OR audit.entity_type ILIKE :search OR audit.ip_address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('audit.created_at', 'DESC').limit(5000);
    return qb.getMany();
  }
}
