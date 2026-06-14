import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PartialDeliverItemDto {
  @IsString()
  orderItemId: string;

  @IsNumber()
  @Min(0)
  deliverQuantity: number;
}

export class PartialDeliverDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialDeliverItemDto)
  items: PartialDeliverItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
