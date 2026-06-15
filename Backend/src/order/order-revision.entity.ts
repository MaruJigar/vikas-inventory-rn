import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('order_revisions')
@Unique(['order_id', 'revision_number'])
export class OrderRevision {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Revision number' })
  revision_number: number;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'Old data' })
  old_data: object;

  @Column({ type: 'jsonb' })
  @ApiProperty({ description: 'New data' })
  new_data: object;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Changed fields' })
  changed_fields: object;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Changed by user id' })
  changed_by_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Changed by role' })
  changed_by_role: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Order status at time' })
  order_status_at_time: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Inventory impact' })
  inventory_impact: object;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Distributor notified' })
  distributor_notified: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Reason' })
  reason: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
