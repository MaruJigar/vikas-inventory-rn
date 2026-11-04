import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class AuditLogQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by actor user ID' })
  @IsOptional()
  @IsUUID()
  actor_user_id?: string;

  @ApiPropertyOptional({ description: 'Filter by action' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsOptional()
  @IsString()
  ip_address?: string;
}
