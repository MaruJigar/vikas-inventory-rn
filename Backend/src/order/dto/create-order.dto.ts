import { IsUUID, IsArray, IsOptional, IsBoolean, IsString, ValidateNested, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderProductDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsOptional()
  @IsEnum(['NONE', 'PERCENTAGE', 'FLAT'])
  itemDiscountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  itemDiscountValue?: number;
}

export class CreateOrderDto {
  @IsUUID()
  visitId: string;

  @IsUUID()
  shopId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsOptional()
  @IsEnum(['NONE', 'PERCENTAGE', 'FLAT'])
  billDiscountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  billDiscountValue?: number;

  @IsOptional()
  @IsBoolean()
  isOfflineCreated?: boolean;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
