import { Entity, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('latest_locations')
export class LatestLocation {
  @Column({ type: 'uuid', primary: true })
  @ApiProperty({ description: 'Salesman id' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Working day id' })
  working_day_id: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Location' })
  location: any;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Accuracy' })
  accuracy: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is tracking active' })
  is_tracking_active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Last updated at' })
  last_updated_at: Date;
}
