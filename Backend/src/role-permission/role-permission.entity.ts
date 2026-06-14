import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('role_permissions')
@Unique(['role_id', 'permission_id'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  role_id: string;

  @Column({ type: 'uuid', nullable: true })
  permission_id: string;

  @CreateDateColumn()
  created_at: Date;
}