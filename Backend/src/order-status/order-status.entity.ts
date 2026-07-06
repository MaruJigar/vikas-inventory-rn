import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order_statuses')
export class OrderStatus {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ description: 'Name of the order status' })
  name: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Sequence number for ordering statuses' })
  sequence: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether an order can be cancelled in this status' })
  can_cancel_order: boolean;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether this status is active' })
  isactive: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether this is a cancellation status' })
  is_cancel_status: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether this is a dispatch status' })
  is_dispatch_status: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'Deleted at' })
  deleted_at: Date;
}
