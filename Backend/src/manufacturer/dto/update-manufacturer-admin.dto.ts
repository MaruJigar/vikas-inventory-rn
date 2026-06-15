import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateManufacturerDto } from './update-manufacturer.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateManufacturerAdminDto extends UpdateManufacturerDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is active' })
  is_active?: boolean;
}
