import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSalesmanDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Full name' })
  full_name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Phone' })
  phone?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Email' })
  email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'State name' })
  state?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: 'State id' })
  state_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'City name' })
  city?: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({ description: 'City id' })
  city_id?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Is active status' })
  is_active?: boolean;
}
