import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../product/product.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('backorders')
@Index('idx_backorders_dist_status', ['distributor_id', 'status'])
@Index('idx_backorders_created_at', ['created_at'])
export class Backorder {
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
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'OPEN' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Resolved quantity' })
  resolved_quantity: number;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Resolved at' })
  resolved_at: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
