import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('approval_logs')
export class ApprovalLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  approval_request_id: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  old_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  new_status: string;

  @Column({ type: 'uuid', nullable: true })
  acted_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}