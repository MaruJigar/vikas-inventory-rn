import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../user/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Old status' })
  old_status: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'New status' })
  new_status: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Changed by user id' })
  changed_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_user_id' })
  changed_by_user: User;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Reason' })
  reason: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
