import { IsString, IsEmail, IsOptional } from 'class-validator';
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
}
