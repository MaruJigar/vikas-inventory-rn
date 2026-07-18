import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { ReviewApprovalDto } from './dto/review-approval.dto';
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
import { ApprovalRequest } from './approval-request.entity';

@Controller('approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Approval')
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get('pending')
  @ApiOperation({ summary: 'Get Pending' })
  @ApiBearerAuth('bearer')
  @ApiPaginatedResponse(ApprovalRequest)
  getPending(@Request() req, @Query() query: ListQueryDto) {
    return this.approvalService.getPendingRequests(req.user, query);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get details' })
  @ApiBearerAuth('bearer')
  getDetails(@Param('id') id: string, @Request() req) {
    return this.approvalService.getApprovalById(id, req.user);
  }

  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post(':id/review')
  @ApiOperation({ summary: 'Review' })
  @ApiBearerAuth('bearer')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewApprovalDto,
    @Request() req,
  ) {
    return this.approvalService.reviewRequest(
      id,
      req.user,
      dto.status,
      dto.rejection_reason,
    );
  }
}
