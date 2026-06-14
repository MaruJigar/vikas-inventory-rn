import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('distributor_inventory')
@Unique(['distributor_id', 'product_id'])
export class DistributorInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  low_stock_threshold: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}