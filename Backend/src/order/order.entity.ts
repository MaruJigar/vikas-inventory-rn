import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  order_number: string;

  @Column({ type: 'uuid' })
  visit_id: string;

  @Column({ type: 'uuid' })
  shop_id: string;

  @Column({ type: 'uuid' })
  salesman_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  manufacturer_id: string;

  @Column({ type: 'varchar', length: 50, default: 'CREATED' })
  status: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  gross_order_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_product_discount_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'NONE' })
  bill_discount_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  bill_discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  bill_discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  final_order_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total_backordered_quantity: number;

  @Column({ type: 'boolean', default: false })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  idempotency_key: string;

  @Column({ type: 'boolean', default: false })
  post_dispatch_edited: boolean;

  @Column({ type: 'boolean', default: false })
  post_delivery_edited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelled_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}