import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAction(action: string, entityType: string, entityId: string | null, actorId: string | null, metadata: any) {
    const log = this.auditLogRepo.create({
      action,
      entity_type: entityType,
      entity_id: entityId as any,
      actor_user_id: actorId as any,
      metadata
    });
    return this.auditLogRepo.save(log);
  }
}
