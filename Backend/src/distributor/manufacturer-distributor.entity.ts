import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from 'typeorm';

@Entity('manufacturer_distributors')
@Unique(['manufacturer_id', 'distributor_id'])
export class ManufacturerDistributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  manufacturer_id: string;

  @Column({ type: 'uuid' })
  distributor_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  rejected_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}