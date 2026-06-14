import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID } from 'class-validator';

export class RegisterSalesmanDto {
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
  @IsUUID()
  distributor_id: string;
}
