import {
  IsUUID,
  IsArray,
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderProductDto {
  @IsUUID()
  @ApiProperty({ description: 'ProductId' })
  productId: string;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({ description: 'Quantity' })
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @ApiProperty({ description: 'VisitId' })
  visitId: string;

  @IsUUID()
  @ApiProperty({ description: 'ShopId' })
  shopId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @ApiProperty({ description: 'Products' })
  products: OrderProductDto[];

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'IsOfflineCreated' })
  isOfflineCreated?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'IdempotencyKey' })
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Transport Mode' })
  transportMode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'Standard Discount Percent' })
  standardDiscountPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'Special Discount Percent' })
  specialDiscountPercent?: number;
}

export class CreateDistributorManufacturerOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @ApiProperty({ description: 'Products' })
  products: OrderProductDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'IdempotencyKey' })
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Transport Mode' })
  transportMode?: string;
}

