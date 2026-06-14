import { IsUUID, IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum MovementType {
  OPENING_STOCK = 'OPENING_STOCK',
  STOCK_ADDED = 'STOCK_ADDED',
  STOCK_REMOVED = 'STOCK_REMOVED',
  STOCK_CORRECTED = 'STOCK_CORRECTED',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT'
}

export class AdjustInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  distributor_id: string;

  @IsUUID()
  @IsNotEmpty()
  product_id: string;

  @IsEnum(MovementType)
  @IsNotEmpty()
  movement_type: MovementType;

  @IsNumber()
  @IsNotEmpty()
  quantity_change: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
