import { IsUUID, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EndVisitDto {
  @IsUUID()
  @ApiProperty({ description: 'VisitId' })
  visitId: string;

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
