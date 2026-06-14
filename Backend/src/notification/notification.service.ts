import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
// import { AppSocketGateway } from '../socket-gateway/socket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    // private socketGateway: AppSocketGateway,
  ) {}

  async createNotification(userId: string, role: string, title: string, message: string, type: string, entityType?: string, entityId?: string) {
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
    
    // Emit to socket room
    // this.socketGateway.broadcastToRoom(`${role}:${userId}`, 'NEW_NOTIFICATION', notif);
    
    return notif;
  }
}
