import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('offline_sync_items')
export class OfflineSyncItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Sync batch id' })
  sync_batch_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'User id' })
  user_id: string;

  @Column({ type: 'varchar', length: 80 })
  @ApiProperty({ description: 'Entity type' })
  entity_type: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Operation' })
  operation: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Local id' })
  local_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Server id' })
  server_id: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  @ApiProperty({ description: 'Idempotency key' })
  idempotency_key: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Payload' })
  payload: any;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Error message' })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Conflict reason' })
  conflict_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Processed at' })
  processed_at: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
