import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateInventorySettingsDto {
  @ApiPropertyOptional({
    description: 'Low stock threshold for inventory',
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  low_stock_threshold?: number | null;
}
