import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DuplicateBypassDto {
  @IsString()
  @IsNotEmpty()
  matched_shop_id: string;

  @IsString()
  @IsNotEmpty()
  match_type: string;
}

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  owner_name?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  gst_number?: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  verification_photo_url: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DuplicateBypassDto)
  duplicate_bypass?: DuplicateBypassDto;
}
