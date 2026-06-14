import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('working_days')
@Index('idx_unique_active_wd', ['salesman_id'], { unique: true, where: "status = 'ACTIVE'" })
export class WorkingDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'timestamp' })
  check_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  check_out_at: Date;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  check_in_location: any;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  check_out_location: any;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  device_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  idempotency_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}