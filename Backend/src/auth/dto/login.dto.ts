import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or phone number',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  email_or_phone: string;

  @ApiProperty({
    description: 'User password (min 6 chars)',
    example: 'secret123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
