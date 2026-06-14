import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('product_price_history')
export class ProductPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  old_mrp: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  new_mrp: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  old_gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  new_gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  old_distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  new_distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  old_special_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  new_special_discount_percent: number;

  @Column({ type: 'uuid', nullable: true })
  changed_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}