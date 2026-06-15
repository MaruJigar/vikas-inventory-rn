import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartialDispatchItemDto {
  @IsString()
  @ApiProperty({ description: 'OrderItemId' })
  orderItemId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'DispatchQuantity' })
  dispatchQuantity: number;
}

export class PartialDispatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialDispatchItemDto)
  @ApiProperty({ description: 'Items' })
  items: PartialDispatchItemDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;
}
