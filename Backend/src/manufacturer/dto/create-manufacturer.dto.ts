import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateManufacturerDto {
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  gst_number?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
