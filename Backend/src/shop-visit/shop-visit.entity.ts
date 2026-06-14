import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shop_visits')
export class ShopVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid' })
  shop_id: string;

  @Column({ type: 'uuid', nullable: true })
  working_day_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  visit_type: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  start_location: any;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  end_location: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  no_order_reason: string;

  @Column({ type: 'text', nullable: true })
  no_order_note: string;

  @Column({ type: 'boolean', default: false })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  idempotency_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}