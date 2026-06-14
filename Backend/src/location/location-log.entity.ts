import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('location_logs')
export class LocationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  working_day_id: string;

  @Column({ type: 'varchar', length: 50 })
  event_type: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  accuracy: number;

  @Column({ type: 'timestamp' })
  captured_at: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  device_id: string;

  @Column({ type: 'varchar', length: 50, default: 'SYNCED' })
  sync_status: string;

  @CreateDateColumn()
  created_at: Date;
}