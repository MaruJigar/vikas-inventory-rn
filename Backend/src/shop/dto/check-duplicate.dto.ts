import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckDuplicateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'City ID' })
  city_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'State ID' })
  state_id?: string;
}
