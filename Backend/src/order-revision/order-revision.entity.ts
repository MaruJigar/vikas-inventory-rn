import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('order_revisions')
@Unique(['order_id', 'revision_number'])
export class OrderRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'int' })
  revision_number: number;

  @Column({ type: 'jsonb' })
  old_data: any;

  @Column({ type: 'jsonb' })
  new_data: any;

  @Column({ type: 'jsonb', nullable: true })
  changed_fields: any;

  @Column({ type: 'uuid', nullable: true })
  changed_by_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  changed_by_role: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  order_status_at_time: string;

  @Column({ type: 'jsonb', nullable: true })
  inventory_impact: any;

  @Column({ type: 'boolean', default: false })
  distributor_notified: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  created_at: Date;
}