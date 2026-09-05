import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceQueryDto {
  @ApiPropertyOptional({ description: 'Start Date in YYYY-MM-DD format (Asia/Kolkata)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End Date in YYYY-MM-DD format (Asia/Kolkata)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Specific Date in YYYY-MM-DD format (Asia/Kolkata)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Month string (01-12) or 1-12' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiPropertyOptional({ description: 'Year string (e.g. 2026)' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'Filter by salesman ID' })
  @IsOptional()
  @IsString()
  salesman_id?: string;

  @ApiPropertyOptional({ description: 'Filter by distributor ID' })
  @IsOptional()
  @IsString()
  distributor_id?: string;

  @ApiPropertyOptional({ description: 'Filter by attendance status (ACTIVE, COMPLETED, MISSED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search term (e.g. salesman name)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
