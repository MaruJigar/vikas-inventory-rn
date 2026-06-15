import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('offline_sync_batches')
export class OfflineSyncBatch {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'User id' })
  user_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Device id' })
  device_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Total items' })
  total_items: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Successful items' })
  successful_items: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Failed items' })
  failed_items: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Conflict items' })
  conflict_items: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Started at' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Completed at' })
  completed_at: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
