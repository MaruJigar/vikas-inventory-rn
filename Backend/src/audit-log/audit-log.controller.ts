import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get System Audit Logs (Paginated, Filterable)' })
  async getAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.getAuditLogs(query);
  }

  @Get('export/csv')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Export Audit Logs to CSV' })
  async exportCsv(@Query() query: AuditLogQueryDto, @Res() res: Response) {
    const logs = await this.auditLogService.getAuditLogsForExport(query);

    const headers = [
      'ID',
      'Timestamp',
      'Actor User ID',
      'Actor Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'Device ID',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.created_at ? new Date(log.created_at).toISOString() : '',
      log.actor_user_id || '',
      log.actor_role || '',
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.entity_type || '').replace(/"/g, '""')}"`,
      log.entity_id || '',
      log.ip_address || '',
      log.device_id || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    return res.status(200).send(csvContent);
  }
}
