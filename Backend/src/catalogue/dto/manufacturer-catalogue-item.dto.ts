import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogueResponseDto } from './catalogue-response.dto';

export class ManufacturerCatalogueItemDto {
  @ApiProperty({ description: 'Manufacturer ID' })
  manufacturer_id: string;

  @ApiProperty({ description: 'Manufacturer company name' })
  company_name: string;

  @ApiPropertyOptional({ description: 'Contact person' })
  contact_person?: string | null;

  @ApiPropertyOptional({ description: 'Email' })
  email?: string | null;

  @ApiPropertyOptional({ description: 'Phone' })
  phone?: string | null;

  @ApiPropertyOptional({ description: 'City' })
  city?: string | null;

  @ApiPropertyOptional({ description: 'State' })
  state?: string | null;

  @ApiProperty({ description: 'Whether manufacturer is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether catalogue has been uploaded' })
  has_catalogue: boolean;

  @ApiPropertyOptional({ description: 'Catalogue details if uploaded', type: () => CatalogueResponseDto })
  catalogue?: CatalogueResponseDto | null;
}
