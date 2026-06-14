import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_salesman_id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  owner_name: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @Column({ type: 'text' })
  verification_photo_url: string;

  @Column({ type: 'varchar', length: 50, default: 'VERIFIED' })
  verification_status: string;

  @Column({ type: 'timestamp', nullable: true })
  last_visit_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_order_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}