import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ShopVisit } from '../visit/shop-visit.entity';
import { Shop } from '../shop/shop.entity';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { User } from '../user/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('orders')
@Index('idx_orders_shop_status', ['shop_id', 'status'])
@Index('idx_orders_salesman_status', ['salesman_id', 'status'])
@Index('idx_orders_dist_status', ['distributor_id', 'status'])
@Index('idx_orders_created_at', ['created_at'])
@Index('idx_orders_idempotency_key', ['idempotency_key'], { unique: true, where: "idempotency_key IS NOT NULL" })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty({ description: 'Order number' })
  order_number: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Visit id' })
  visit_id: string;

  @ManyToOne(() => ShopVisit)
  @JoinColumn({ name: 'visit_id' })
  visit: ShopVisit;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Shop id' })
  shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Salesman id' })
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

  @Column({ type: 'varchar', length: 50, default: 'CREATED' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Gross order amount' })
  gross_order_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Total product discount amount' })
  total_product_discount_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'NONE' })
  @ApiProperty({ description: 'Bill discount type' })
  bill_discount_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Bill discount value' })
  bill_discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Bill discount amount' })
  bill_discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Final order amount' })
  final_order_amount: number;

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
