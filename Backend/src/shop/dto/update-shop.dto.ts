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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Google Maps link for the shop location' })
  maps_link?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'City ID' })
  city_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'State ID' })
  state_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Verification photo url' })
  verification_photo_url?: string;
}
