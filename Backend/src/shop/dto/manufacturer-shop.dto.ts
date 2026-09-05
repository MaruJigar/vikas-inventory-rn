import { ApiProperty } from '@nestjs/swagger';

export class ManufacturerShopDto {
  @ApiProperty({ description: 'Shop ID' })
  id: string;

  @ApiProperty({ description: 'Shop Name' })
  name: string;

  @ApiProperty({ description: 'City Name' })
  city: string;

  @ApiProperty({ description: 'State Name' })
  state: string;
}
