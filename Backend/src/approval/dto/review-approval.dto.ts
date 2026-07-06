import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewApprovalDto {
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  @ApiProperty({ description: 'Status' })
  status: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejection_reason?: string;
}
