import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NoOrderVisitDto {
  @IsUUID()
  @ApiProperty({ description: 'VisitId' })
  visitId: string;

  @IsString()
  @ApiProperty({ description: 'Reason' })
  reason: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Note' })
  note?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Latitude' })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Longitude' })
  longitude?: number;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: 'EndedAt' })
  endedAt?: string;
}
