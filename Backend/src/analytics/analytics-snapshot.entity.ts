import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('analytics_snapshots')
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Owner type' })
  owner_type: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Owner id' })
  owner_id: string;

  @Column({ type: 'varchar', length: 80 })
  @ApiProperty({ description: 'Snapshot type' })
  snapshot_type: string;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Date from' })
  date_from: string;

  @Column({ type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Date to' })
  date_to: string;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Data' })
  data: any;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
