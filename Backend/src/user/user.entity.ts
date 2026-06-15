import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Full name' })
  full_name: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: true })
  @ApiPropertyOptional({ description: 'Email' })
  email: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Password hash' })
  password_hash: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Role' })
  role: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  @ApiProperty({ description: 'Approval status' })
  approval_status: string;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Is active' })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Hashed refresh token' })
  hashed_refresh_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Last login at' })
  last_login_at: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'Deleted at' })
  deleted_at: Date;
}
