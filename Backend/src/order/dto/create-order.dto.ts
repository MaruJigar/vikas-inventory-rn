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

  @IsOptional()
  @IsEnum(['NONE', 'PERCENTAGE', 'FLAT'])
  @ApiPropertyOptional({ description: 'ItemDiscountType' })
  itemDiscountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'ItemDiscountValue' })
  itemDiscountValue?: number;
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
  @IsEnum(['NONE', 'PERCENTAGE', 'FLAT'])
  @ApiPropertyOptional({ description: 'BillDiscountType' })
  billDiscountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ description: 'BillDiscountValue' })
  billDiscountValue?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'IsOfflineCreated' })
  isOfflineCreated?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'IdempotencyKey' })
  idempotencyKey?: string;
}
