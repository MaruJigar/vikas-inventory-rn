import { IsNumber, IsOptional, IsString, IsISO8601, Min, Max, IsEnum } from 'class-validator';

export class CreateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsISO8601()
  captured_at: string;

  @IsString()
  @IsOptional()
  device_id?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['PERIODIC', 'CHECK_IN', 'CHECK_OUT', 'VISIT_START', 'VISIT_END', 'ORDER_CREATED', 'ORDER_EDITED'])
  event_type?: string;
  
  @IsString()
  @IsOptional()
  idempotency_key?: string;
}
