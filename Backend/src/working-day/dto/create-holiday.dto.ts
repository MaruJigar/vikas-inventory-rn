import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ description: 'Holiday calendar date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  holiday_date: string;

  @ApiProperty({ description: 'Holiday name/description' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
