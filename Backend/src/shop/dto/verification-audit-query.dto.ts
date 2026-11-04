import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class VerificationAuditQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by verification status (PENDING, APPROVED, REJECTED)' })
  @IsOptional()
  @IsString()
  verification_status?: string;
}

