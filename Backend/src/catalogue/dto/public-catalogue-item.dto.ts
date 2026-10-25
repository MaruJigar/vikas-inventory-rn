import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicCatalogueItemDto {
  @ApiProperty({ description: 'Manufacturer ID (UUID)' })
  manufacturerId: string;

  @ApiProperty({ description: 'Manufacturer company name' })
  manufacturerName: string;

  @ApiProperty({ description: 'Original catalogue filename' })
  fileName: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSizeBytes: number;

  @ApiProperty({ description: 'Last updated timestamp (ISO)' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'City of the manufacturer' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'State of the manufacturer' })
  state?: string | null;

  @ApiProperty({ description: 'Public URL to view or stream the catalogue PDF' })
  pdfUrl: string;

  @ApiProperty({ description: 'Public URL to download the catalogue PDF attachment' })
  downloadUrl: string;
}
