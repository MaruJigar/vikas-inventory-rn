import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class CreateDistributorAdminDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  manufacturer_id?: string;

  @IsNotEmpty()
  @IsString()
  business_name: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
