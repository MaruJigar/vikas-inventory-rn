import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('location_logs')
export class LocationLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Salesman id' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Working day id' })
  working_day_id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Event type' })
  event_type: string;

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

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Captured at' })
  captured_at: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Device id' })
  device_id: string;

  @Column({ type: 'varchar', length: 50, default: 'SYNCED' })
  @ApiProperty({ description: 'Sync status' })
  sync_status: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
