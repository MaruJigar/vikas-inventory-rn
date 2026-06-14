import { Controller, Post, Body, Param, UseGuards, Request, Get } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ReviewApprovalDto } from './dto/review-approval.dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get('pending')
  getPending(@Request() req) {
    return this.approvalService.getPendingRequests(req.user);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post(':id/review')
  review(@Param('id') id: string, @Body() dto: ReviewApprovalDto, @Request() req) {
    return this.approvalService.reviewRequest(id, req.user, dto.status, dto.rejection_reason);
  }
}
