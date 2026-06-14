import { Entity, Column } from 'typeorm';

@Entity('latest_locations')
export class LatestLocation {
  @Column({ type: 'uuid', primary: true })
  salesman_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  working_day_id: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  accuracy: number;

  @Column({ type: 'boolean', default: false })
  is_tracking_active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_updated_at: Date;
}