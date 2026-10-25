import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManufacturerShopDto {
  @ApiProperty({ description: 'Shop ID' })
  id: string;

  @ApiProperty({ description: 'Shop Name' })
  name: string;

  @ApiPropertyOptional({ description: 'Owner Name' })
  owner_name?: string;

  @ApiProperty({ description: 'Phone Number' })
  phone: string;

  @ApiProperty({ description: 'City Name' })
  city: string;

  @ApiProperty({ description: 'State Name' })
  state: string;
}

