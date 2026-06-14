import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDistributorDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  business_name: string;

  @IsOptional()
  @IsString()
  gst_number?: string;
}
