import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('offline_sync_batches')
export class OfflineSyncBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  device_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'int', default: 0 })
  total_items: number;

  @Column({ type: 'int', default: 0 })
  successful_items: number;

  @Column({ type: 'int', default: 0 })
  failed_items: number;

  @Column({ type: 'int', default: 0 })
  conflict_items: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}