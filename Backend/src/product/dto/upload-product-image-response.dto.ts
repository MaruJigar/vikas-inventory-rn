import { ApiProperty } from '@nestjs/swagger';

export class UploadProductImageResponseDto {
  @ApiProperty({
    description: 'Publicly accessible URL of the uploaded product image',
  })
  url: string;
}
