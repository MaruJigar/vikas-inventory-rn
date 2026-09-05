import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Distributor } from '../distributor/distributor.entity';
import { User } from '../user/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('fulfillment_logs')
export class FulfillmentLog {
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
  @ApiPropertyOptional({ description: 'Order item id' })
  order_item_id: string;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  order_item: OrderItem;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by_user_id' })
  performed_by_user: User;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Notes' })
  notes: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
