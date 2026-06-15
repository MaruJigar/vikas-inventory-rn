import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('shop_visits')
export class ShopVisit {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Salesman id' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Shop id' })
  shop_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Working day id' })
  working_day_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Visit type' })
  visit_type: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Started at' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Ended at' })
  ended_at: Date;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Start location' })
  start_location: any;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'End location' })
  end_location: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'No order reason' })
  no_order_reason: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'No order note' })
  no_order_note: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is offline created' })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
