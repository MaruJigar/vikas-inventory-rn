import { Controller, Get, Patch, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getNotifications(@Request() req, @Query() query: ListQueryDto) {
    return this.notificationService.getNotifications(req.user.userId, query);
  }

  @Get('unread-count')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  @Patch('read-all')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationService.deleteNotification(id, req.user.userId);
  }
}
