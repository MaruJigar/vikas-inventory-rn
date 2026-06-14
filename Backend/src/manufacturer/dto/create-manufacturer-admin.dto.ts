import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { CreateManufacturerDto } from './create-manufacturer.dto';

export class CreateManufacturerAdminDto extends CreateManufacturerDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
