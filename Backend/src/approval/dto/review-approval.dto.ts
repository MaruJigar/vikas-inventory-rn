import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class ReviewApprovalDto {
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  rejection_reason?: string;
}
