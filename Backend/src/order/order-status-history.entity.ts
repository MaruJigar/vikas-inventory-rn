import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  old_status: string;

  @Column({ type: 'varchar', length: 50 })
  new_status: string;

  @Column({ type: 'uuid', nullable: true })
  changed_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}