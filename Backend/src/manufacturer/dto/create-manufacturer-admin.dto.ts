import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { CreateManufacturerDto } from './create-manufacturer.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManufacturerAdminDto extends CreateManufacturerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Password' })
  password: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Is active' })
  is_active?: boolean;
}
