import { IsArray, IsOptional, IsString, ValidateNested, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderProductDto } from './create-order.dto';

export class UpdateOrderDto {
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
  @IsString()
  reason?: string;
}

export class CancelOrderDto {
  @IsString()
  cancellationReason: string;
}
