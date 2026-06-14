import { IsUUID, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class NoOrderVisitDto {
  @IsUUID()
  visitId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
