import { IsUUID, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class EndVisitDto {
  @IsUUID()
  visitId: string;

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
