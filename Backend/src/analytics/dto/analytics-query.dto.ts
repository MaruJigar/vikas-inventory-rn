import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Predefined period aggregation',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
  })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

  @ApiPropertyOptional({ description: 'Start date in ISO format or YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date in ISO format or YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Configurable limit for leaderboards or lists' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
