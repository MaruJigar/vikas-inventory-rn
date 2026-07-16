import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @IsNotEmpty()
  @IsIn(['MANUFACTURER_CREATED', 'DISTRIBUTOR_CREATED'])
  @ApiProperty({ description: 'Product source' })
  product_source: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Manufacturer id' })
  manufacturer_id?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Distributor id' })
  distributor_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'External manufacturer name' })
  external_manufacturer_name?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Category id' })
  category_id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Name' })
  name: string;

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

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ description: 'Mrp' })
  mrp: number;

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
