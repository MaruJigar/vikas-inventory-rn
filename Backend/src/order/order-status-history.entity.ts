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
import { OrderStatus } from '../order-status/order-status.entity';
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

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Old status ID' })
  old_status_id: string;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'old_status_id' })
  old_status: OrderStatus;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ description: 'New status ID' })
  new_status_id: string;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'new_status_id' })
  new_status: OrderStatus;

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
