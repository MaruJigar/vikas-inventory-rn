import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  recipient_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recipient_role: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 80 })
  type: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'boolean', default: false })
  firebase_sent: boolean;

  @Column({ type: 'boolean', default: false })
  socket_sent: boolean;

  @CreateDateColumn()
  created_at: Date;
}