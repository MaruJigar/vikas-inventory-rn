import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartVisitDto {
  @IsUUID()
  @ApiProperty({ description: 'ShopId' })
  shopId: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Latitude' })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Longitude' })
  longitude?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'VisitType' })
  visitType?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'IsOfflineCreated' })
  isOfflineCreated?: boolean;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'IdempotencyKey' })
  idempotencyKey?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: 'StartedAt' })
  startedAt?: string;
}
