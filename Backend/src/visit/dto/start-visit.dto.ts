import { IsUUID, IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class StartVisitDto {
  @IsUUID()
  shopId: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  visitType?: string;

  @IsOptional()
  @IsBoolean()
  isOfflineCreated?: boolean;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;
}
