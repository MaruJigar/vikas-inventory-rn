import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLocationDto } from './create-location.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchLocationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLocationDto)
  @ArrayMinSize(1)
  @ApiProperty({ description: 'Locations' })
  locations: CreateLocationDto[];
}
