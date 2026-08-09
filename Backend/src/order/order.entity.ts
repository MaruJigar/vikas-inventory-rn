import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { ShopVisit } from '../visit/shop-visit.entity';
import { Shop } from '../shop/shop.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { User } from '../user/user.entity';
import { OrderStatus } from '../order-status/order-status.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('orders')
@Index('idx_orders_shop_status', ['shop_id', 'status_id'])
@Index('idx_orders_salesman_status', ['salesman_id', 'status_id'])
@Index('idx_orders_dist_status', ['distributor_id', 'status_id'])
@Index('idx_orders_created_at', ['created_at'])
@Index('idx_orders_idempotency_key', ['idempotency_key'], {
  unique: true,
  where: 'idempotency_key IS NOT NULL',
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ description: 'Order number' })
  order_number: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Visit id', required: false })
  visit_id: string;

  @ManyToOne(() => ShopVisit, visit => visit.orders)
  @JoinColumn({ name: 'visit_id' })
  visit: ShopVisit;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Shop id', required: false })
  shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Salesman id', required: false })
  salesman_id: string;

  @ManyToOne(() => Salesman)
  @JoinColumn({ name: 'salesman_id' })
  salesman: Salesman;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @ManyToOne(() => Manufacturer)
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Status ID' })
  status_id: string;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'status_id' })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Gross order amount' })
  gross_order_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total gst amount' })
  total_gst_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Standard discount percent' })
  standard_discount_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Standard discount amount' })
  standard_discount_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Distributor discount percent' })
  distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Distributor discount amount' })
  distributor_discount_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Distributor margin percent' })
  distributor_margin_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Distributor margin amount' })
  distributor_margin_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Freight discount percent' })
  freight_discount_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Freight discount amount' })
  freight_discount_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Cash discount percent' })
  cash_discount_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Cash discount amount' })
  cash_discount_amount: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Special discount percent' })
  special_discount_percent: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Special discount amount' })
  special_discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Final order amount' })
  final_order_amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Transport mode' })
  transport_mode: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total quantity' })
  total_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total backordered quantity' })
  total_backordered_quantity: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is offline created' })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Post dispatch edited' })
  post_dispatch_edited: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Post delivery edited' })
  post_delivery_edited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Cancelled at' })
  cancelled_at: Date;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Cancelled by user id' })
  cancelled_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelled_by_user_id' })
  cancelled_by_user: User;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancellation_reason: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

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
