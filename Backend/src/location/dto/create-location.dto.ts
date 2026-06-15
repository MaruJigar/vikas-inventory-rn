import {
  IsNumber,
  IsOptional,
  IsString,
  IsISO8601,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty({ description: 'Latitude' })
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty({ description: 'Longitude' })
  longitude: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Accuracy' })
  accuracy?: number;

  @IsISO8601()
  @ApiProperty({ description: 'Captured at' })
  captured_at: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Device id' })
  device_id?: string;

  @IsString()
  @IsOptional()
  @IsEnum([
    'PERIODIC',
    'CHECK_IN',
    'CHECK_OUT',
    'VISIT_START',
    'VISIT_END',
    'ORDER_CREATED',
    'ORDER_EDITED',
  ])
  @ApiPropertyOptional({ description: 'Event type' })
  event_type?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key?: string;
}
