import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogueResponseDto {
  @ApiProperty({ description: 'Catalogue ID' })
  id: string;

  @ApiProperty({ description: 'Manufacturer ID' })
  manufacturer_id: string;

  @ApiProperty({ description: 'Original uploaded filename' })
  original_filename: string;

  @ApiProperty({ description: 'File size in bytes' })
  file_size_bytes: number;

  @ApiProperty({ description: 'MIME type' })
  mime_type: string;

  @ApiProperty({ description: 'API download URL' })
  download_url: string;

  @ApiProperty({ description: 'API view URL' })
  view_url: string;

  @ApiProperty({ description: 'Availability status' })
  is_available: boolean;

  @ApiPropertyOptional({ description: 'Uploader user ID' })
  uploaded_by_user_id?: string | null;

  @ApiProperty({ description: 'Upload date' })
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  updated_at: Date;
}
