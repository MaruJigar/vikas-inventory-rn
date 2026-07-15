import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalesmanAdminDto {
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'User password (min 6 chars)',
    example: 'secret123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Distributor ID (Required if Manufacturer Admin is creating)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  distributor_id: string;

  @ApiProperty({ description: 'State id' })
  @IsNotEmpty()
  @IsUUID()
  state_id: string;

  @ApiProperty({ description: 'State name' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiPropertyOptional({ description: 'City id' })
  @IsOptional()
  @IsUUID()
  city_id?: string;

  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;
}
