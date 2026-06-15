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

export class PartialDeliverItemDto {
  @IsString()
  @ApiProperty({ description: 'OrderItemId' })
  orderItemId: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'DeliverQuantity' })
  deliverQuantity: number;
}

export class PartialDeliverDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialDeliverItemDto)
  @ApiProperty({ description: 'Items' })
  items: PartialDeliverItemDto[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;
}
