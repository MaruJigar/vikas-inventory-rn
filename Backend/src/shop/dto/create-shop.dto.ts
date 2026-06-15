import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DuplicateBypassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Matched shop id' })
  matched_shop_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Match type' })
  match_type: string;
}

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Owner name' })
  owner_name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Address' })
  address: string;

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
  @IsNotEmpty()
  @ApiProperty({ description: 'Latitude' })
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Longitude' })
  longitude: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Verification photo url' })
  verification_photo_url?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DuplicateBypassDto)
  @ApiPropertyOptional({ description: 'Duplicate bypass' })
  duplicate_bypass?: DuplicateBypassDto;
}
