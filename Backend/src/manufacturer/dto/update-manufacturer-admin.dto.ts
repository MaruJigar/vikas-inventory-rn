import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateManufacturerDto } from './update-manufacturer.dto';

export class UpdateManufacturerAdminDto extends UpdateManufacturerDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
