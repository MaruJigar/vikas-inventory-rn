import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('offline_sync_items')
export class OfflineSyncItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  sync_batch_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 80 })
  entity_type: string;

  @Column({ type: 'varchar', length: 50 })
  operation: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  local_id: string;

  @Column({ type: 'uuid', nullable: true })
  server_id: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  idempotency_key: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  conflict_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @CreateDateColumn()
  created_at: Date;
}