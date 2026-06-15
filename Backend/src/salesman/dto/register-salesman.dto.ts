import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterSalesmanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Full name' })
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Email' })
  email?: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'Password' })
  password: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;
}
