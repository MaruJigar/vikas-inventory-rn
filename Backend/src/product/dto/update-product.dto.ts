import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  product_image_url?: string;

  @IsOptional()
  @IsNumber()
  mrp?: number;

  @IsOptional()
  @IsNumber()
  gst_percent?: number;

  @IsOptional()
  @IsNumber()
  distributor_discount_percent?: number;

  @IsOptional()
  @IsNumber()
  special_discount_percent?: number;
}
