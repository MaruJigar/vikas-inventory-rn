import { IsArray, IsInt, Min, Max, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWorkingScheduleDto {
  @ApiProperty({ description: 'Array of working days (0=Sun, 1=Mon, ..., 6=Sat)', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(7)
  working_days: number[];
}
