import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PartialDispatchItemDto {
  @IsString()
  orderItemId: string;

  @IsNumber()
  @Min(0)
  dispatchQuantity: number;
}

export class PartialDispatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialDispatchItemDto)
  items: PartialDispatchItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
