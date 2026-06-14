import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateSalesmanDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
