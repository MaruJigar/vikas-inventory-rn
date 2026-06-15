import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MovementType {
  OPENING_STOCK = 'OPENING_STOCK',
  STOCK_ADDED = 'STOCK_ADDED',
  STOCK_REMOVED = 'STOCK_REMOVED',
  STOCK_CORRECTED = 'STOCK_CORRECTED',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export class AdjustInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @IsEnum(MovementType)
  @IsNotEmpty()
  @ApiProperty({ description: 'Movement type' })
  movement_type: MovementType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Quantity change' })
  quantity_change: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Reason' })
  reason?: string;
}
