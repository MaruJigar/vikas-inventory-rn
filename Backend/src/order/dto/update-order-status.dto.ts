import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'Target order status ID',
  })
  status_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Target order status name',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Optional notes for the transition' })
  notes?: string;
}
