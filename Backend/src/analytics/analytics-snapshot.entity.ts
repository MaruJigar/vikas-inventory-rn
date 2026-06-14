import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('analytics_snapshots')
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  owner_type: string;

  @Column({ type: 'uuid' })
  owner_id: string;

  @Column({ type: 'varchar', length: 80 })
  snapshot_type: string;

  @Column({ type: 'date', nullable: true })
  date_from: string;

  @Column({ type: 'date', nullable: true })
  date_to: string;

  @Column({ type: 'jsonb' })
  data: any;

  @CreateDateColumn()
  created_at: Date;
}