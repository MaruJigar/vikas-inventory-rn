import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Name' })
  name: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Parent id' })
  parent_id?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description' })
  description?: string;
}
