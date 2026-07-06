import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Sku' })
  sku?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Unit' })
  unit?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Product image url' })
  product_image_url?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Mrp' })
  mrp?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Gst percent' })
  gst_percent?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Distributor discount percent' })
  distributor_discount_percent?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Special discount percent' })
  special_discount_percent?: number;
}
