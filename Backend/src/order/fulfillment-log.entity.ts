import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('fulfillment_logs')
export class FulfillmentLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Order item id' })
  order_item_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Action' })
  action: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Quantity' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Old status' })
  old_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'New status' })
  new_status: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Performed by user id' })
  performed_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Notes' })
  notes: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
