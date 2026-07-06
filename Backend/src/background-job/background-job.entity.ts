import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('background_jobs')
export class BackgroundJob {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Job type' })
  job_type: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Payload' })
  payload: any;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Attempts' })
  attempts: number;

  @Column({ type: 'int', default: 5 })
  @ApiProperty({ description: 'Max attempts' })
  max_attempts: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Scheduled at' })
  scheduled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Started at' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Completed at' })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Failed at' })
  failed_at: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Error message' })
  error_message: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
