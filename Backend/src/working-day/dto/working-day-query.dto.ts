import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class WorkingDayQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by salesman id' })
  @IsOptional()
  @IsString()
  salesman_id?: string;

}
