import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ResolveBackorderDto {
  @ApiProperty({ description: 'The quantity being resolved' })
  @IsNumber()
  @Min(1)
  resolved_quantity: number;

  @ApiPropertyOptional({ description: 'Optional notes regarding the resolution' })
  @IsOptional()
  @IsString()
  notes?: string;
}
