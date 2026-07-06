import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ description: 'Limit' })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search' })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'SortBy' })
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  @ApiPropertyOptional({ description: 'SortOrder' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: 'StartDate' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ description: 'EndDate' })
  endDate?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Status' })
  status?: string;
}
