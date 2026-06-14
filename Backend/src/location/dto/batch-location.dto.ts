import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';

export class BatchLocationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  @ArrayMinSize(1)
  locations: CreateLocationDto[];
}
