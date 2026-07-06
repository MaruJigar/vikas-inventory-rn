import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  @ApiProperty({ description: 'Key' })
  key: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Description' })
  description: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
