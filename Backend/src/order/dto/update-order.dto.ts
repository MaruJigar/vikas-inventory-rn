import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderProductDto } from './create-order.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderDto {
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
  @IsString()
  @ApiPropertyOptional({ description: 'Reason' })
  reason?: string;
}

export class CancelOrderDto {
  @IsString()
  @ApiProperty({ description: 'CancellationReason' })
  cancellationReason: string;
}
