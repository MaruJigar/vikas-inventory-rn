import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateDistributorProfileDto } from './update-distributor-profile.dto';

export class UpdateDistributorAdminDto extends UpdateDistributorProfileDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
