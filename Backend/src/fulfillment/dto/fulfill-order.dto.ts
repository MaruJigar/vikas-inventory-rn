import { IsOptional, IsString } from 'class-validator';

export class FulfillOrderDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
