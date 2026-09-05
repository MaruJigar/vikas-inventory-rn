import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date in ISO format' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date in ISO format' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
