import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  email_or_phone: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
