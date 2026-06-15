import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('role_permissions')
@Unique(['role_id', 'permission_id'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Role id' })
  role_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Permission id' })
  permission_id: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
