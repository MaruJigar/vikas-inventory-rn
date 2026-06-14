import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsIn, ValidateIf } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsIn(['MANUFACTURER_CREATED', 'DISTRIBUTOR_CREATED'])
  product_source: string;

  @ValidateIf(o => o.product_source === 'MANUFACTURER_CREATED')
  @IsNotEmpty()
  @IsUUID()
  manufacturer_id?: string;

  @ValidateIf(o => o.product_source === 'DISTRIBUTOR_CREATED')
  @IsNotEmpty()
  @IsUUID()
  distributor_id?: string;

  @ValidateIf(o => o.product_source === 'DISTRIBUTOR_CREATED')
  @IsNotEmpty()
  @IsString()
  external_manufacturer_name?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

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

  @IsNotEmpty()
  @IsNumber()
  mrp: number;

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
