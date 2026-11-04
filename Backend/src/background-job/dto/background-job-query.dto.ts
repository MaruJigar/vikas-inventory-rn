import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class BackgroundJobQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by job type' })
  @IsOptional()
  @IsString()
  job_type?: string;
}
