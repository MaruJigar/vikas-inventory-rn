import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @IsUUID()
  @ApiProperty({
    description: 'Target order status ID',
  })
  status_id: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Optional notes for the transition' })
  notes?: string;
}
