import { IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';
import { UpdateDistributorProfileDto } from './update-distributor-profile.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDistributorAdminDto extends UpdateDistributorProfileDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is active' })
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ description: 'Manufacturer ids', type: [String] })
  manufacturer_ids?: string[];
}
