import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actor_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  actor_role: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value: any;

  @Column({ type: 'jsonb', nullable: true })
  new_value: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'varchar', length: 80, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  device_id: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: any;

  @CreateDateColumn()
  created_at: Date;
}