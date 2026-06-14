import { IsString, IsEmail, IsNotEmpty, IsUUID, MinLength, IsOptional } from 'class-validator';

export class RegisterSalesmanDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  @IsNotEmpty()
  distributor_id: string;
}
