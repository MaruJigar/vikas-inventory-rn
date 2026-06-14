import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_id: string;

  @Column({ type: 'varchar', length: 50 })
  movement_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  quantity_change: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  previous_available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  new_available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  previous_reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  new_reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  previous_backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  new_backordered_quantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  changed_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;
}