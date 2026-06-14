import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 200 })
  product_name_snapshot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku_snapshot: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  manufacturer_name_snapshot: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  mrp: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  gross_line_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'NONE' })
  item_discount_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  item_discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  item_discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  net_line_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  dispatched_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  delivered_quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'ORDERED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}