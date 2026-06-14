import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('backorders')
export class Backorder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid' })
  order_item_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'OPEN' })
  status: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  resolved_quantity: number;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
