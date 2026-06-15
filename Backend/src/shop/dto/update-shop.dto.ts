import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShopDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Owner name' })
  owner_name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Phone' })
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'State' })
  state?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Gst number' })
  gst_number?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Latitude' })
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Longitude' })
  longitude?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Verification photo url' })
  verification_photo_url?: string;
}
