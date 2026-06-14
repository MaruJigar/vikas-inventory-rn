import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  device_id?: string;

  @IsString()
  @IsOptional()
  idempotency_key?: string;
}
