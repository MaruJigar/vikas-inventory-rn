import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDistributorAdminDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Password' })
  password: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Manufacturer id' })
  manufacturer_id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Business name' })
  business_name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Contact person' })
  contact_person?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Email' })
  email: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Gst number' })
  gst_number?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is active' })
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'State' })
  state?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Country' })
  country?: string;
}
