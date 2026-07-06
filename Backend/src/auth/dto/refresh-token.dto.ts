import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token', example: 'eyJhbG...' })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
