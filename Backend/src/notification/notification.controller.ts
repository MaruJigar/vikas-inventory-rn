import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ListQueryDto } from '../common/dto/list-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { Notification } from './notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Notifications' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(Notification)
  async getNotifications(@Request() req, @Query() query: ListQueryDto) {
    return this.notificationService.getNotifications(req.user.userId, query);
  }

  @Get('unread-count')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Get Unread Count' })
  @ApiBearerAuth('bearer')
  async getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  @Patch('read-all')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Mark All As Read' })
  @ApiBearerAuth('bearer')
  async markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Mark As Read' })
  @ApiBearerAuth('bearer')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({ summary: 'Delete Notification' })
  @ApiBearerAuth('bearer')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    return this.notificationService.deleteNotification(id, req.user.userId);
  }
}
