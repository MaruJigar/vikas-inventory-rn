import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('approval_requests')
@Index('idx_approvals_dist_status', ['distributor_id', 'status'])
@Index('idx_approvals_mfr_status', ['manufacturer_id', 'status'])
@Index('idx_approvals_created_at', ['created_at'])
export class ApprovalRequest {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Request type' })
  request_type: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Requester user id' })
  requester_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Salesman id' })
  salesman_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Submitted at' })
  submitted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Reviewed by user id' })
  reviewed_by_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Reviewed at' })
  reviewed_at: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejection_reason: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Metadata' })
  metadata: any;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
