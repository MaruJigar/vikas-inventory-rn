import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FulfillOrderDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;
}
