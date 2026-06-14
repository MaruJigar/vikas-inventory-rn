import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('fulfillment_logs')
export class FulfillmentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'uuid', nullable: true })
  order_item_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  old_status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  new_status: string;

  @Column({ type: 'uuid', nullable: true })
  performed_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}