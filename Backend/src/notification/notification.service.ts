import { Injectable, NotFoundException } from '@nestjs/common';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { AppSocketGateway } from '../socket-gateway/socket.gateway';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    private readonly socketGateway: AppSocketGateway,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createNotification(
    userId: string,
    role: string,
    title: string,
    message: string,
    type: string,
    entityType?: string,
    entityId?: string,
  ) {
    const notif = this.notifRepo.create({
      recipient_user_id: userId,
      recipient_role: role,
      title,
      message,
      type,
      entity_type: entityType,
      entity_id: entityId,
      is_read: false,
    });

    await this.notifRepo.save(notif);

    await this.auditLogService.logAction(
      'SYSTEM',
      'NOTIFICATION_CREATED',
      'Notification',
      notif.id,
      { recipient: userId, type },
    );
    this.socketGateway.broadcastToRoom(
      `user:${userId}`,
      'NOTIFICATION_CREATED',
      notif,
    );

    return notif;
  }

  async getNotifications(
    userId: string,
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder = 'DESC',
      startDate,
      endDate,
      status,
    } = queryDto;
    const skip = (page - 1) * limit;

    const qb = this.notifRepo
      .createQueryBuilder('notif')
      .where('notif.recipient_user_id = :userId', { userId });

    if (search) {
      qb.andWhere(
        '(notif.title ILIKE :search OR notif.message ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status !== undefined) {
      // For notifications, 'status' could map to 'is_read'
      if (status === 'UNREAD') {
        qb.andWhere('notif.is_read = :isRead', { isRead: false });
      } else if (status === 'READ') {
        qb.andWhere('notif.is_read = :isRead', { isRead: true });
      } else {
        qb.andWhere('notif.type = :type', { type: status });
      }
    }

    if (startDate)
      qb.andWhere('notif.created_at >= :startDate', {
        startDate: new Date(startDate),
      });
    if (endDate)
      qb.andWhere('notif.created_at <= :endDate', {
        endDate: new Date(endDate),
      });

    const allowedSortFields = ['created_at', 'is_read'];
    if (sortBy && allowedSortFields.includes(sortBy)) {
      qb.orderBy(`notif.${sortBy}`, sortOrder);
    } else {
      qb.orderBy('notif.created_at', 'DESC');
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

  async getUnreadCount(userId: string) {
    const count = await this.notifRepo.count({
      where: { recipient_user_id: userId, is_read: false },
    });
    return { unread_count: count };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await this.notifRepo.findOne({
      where: { id, recipient_user_id: userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');

    notif.is_read = true;
    notif.read_at = new Date();
    await this.notifRepo.save(notif);

    await this.auditLogService.logAction(
      userId,
      'NOTIFICATION_READ',
      'Notification',
      notif.id,
      {},
    );
    this.socketGateway.broadcastToRoom(`user:${userId}`, 'NOTIFICATION_READ', {
      id: notif.id,
    });

    return notif;
  }

  async markAllAsRead(userId: string) {
    await this.notifRepo.update(
      { recipient_user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    const notif = await this.notifRepo.findOne({
      where: { id, recipient_user_id: userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');

    await this.notifRepo.remove(notif);
    await this.auditLogService.logAction(
      userId,
      'NOTIFICATION_DELETED',
      'Notification',
      id,
      {},
    );

    return { success: true };
  }
}
