import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckOutDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Latitude' })
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Longitude' })
  longitude: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Device id' })
  device_id?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key?: string;
}
