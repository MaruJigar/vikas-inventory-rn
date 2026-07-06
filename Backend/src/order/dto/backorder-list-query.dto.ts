import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class BackorderListQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by specific distributor UUID' })
  @IsOptional()
  @IsUUID()
  distributor_id?: string;

  @ApiPropertyOptional({ description: 'Filter by specific salesman UUID' })
  @IsOptional()
  @IsUUID()
  salesman_id?: string;
}
