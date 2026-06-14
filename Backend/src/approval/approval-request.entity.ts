import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('approval_requests')
export class ApprovalRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  request_type: string;

  @Column({ type: 'uuid', nullable: true })
  requester_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  manufacturer_id: string;

  @Column({ type: 'uuid', nullable: true })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  salesman_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submitted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}