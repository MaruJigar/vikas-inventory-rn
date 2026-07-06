import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSalesmanStatusDto {
  @IsBoolean()
  @ApiProperty({ description: 'Is active status' })
  is_active: boolean;
}
