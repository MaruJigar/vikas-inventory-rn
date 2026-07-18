import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDistributorProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Business name' })
  business_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Owner name' })
  owner_name?: string;

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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Country' })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Pincode' })
  pincode?: string;
}
