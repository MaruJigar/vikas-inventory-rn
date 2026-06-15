import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateManufacturerDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Company name' })
  company_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Contact person' })
  contact_person?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Phone' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ description: 'Email' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Gst number' })
  gst_number?: string;

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
}
