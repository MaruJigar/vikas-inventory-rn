import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class UpdateOrderStatusDto {
  @IsEnum(['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED'])
  @ApiProperty({
    description: 'Target order status',
    enum: ['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED'],
  })
  status: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Optional notes for the transition' })
  notes?: string;
}
