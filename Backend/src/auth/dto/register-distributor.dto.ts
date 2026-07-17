import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDistributorDto {
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

  @ApiProperty({ description: 'Business Name', example: 'Doe Distributors' })
  @IsNotEmpty()
  @IsString()
  business_name: string;

  @ApiPropertyOptional({
    description: 'GST Number',
    example: '22AAAAA0000A1Z5',
  })
  @IsOptional()
  @IsString()
  gst_number?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Is internal distributor' })
  @IsOptional()
  @IsBoolean()
  is_internal_distributor?: boolean;

  @ApiProperty({
    description: 'Manufacturer ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  manufacturer_id: string;
}
