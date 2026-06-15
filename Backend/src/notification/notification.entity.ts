import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Recipient user id' })
  recipient_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Recipient role' })
  recipient_role: string;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Title' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Message' })
  message: string;

  @Column({ type: 'varchar', length: 80 })
  @ApiProperty({ description: 'Type' })
  type: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  @ApiPropertyOptional({ description: 'Entity type' })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Entity id' })
  entity_id: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is read' })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Read at' })
  read_at: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Firebase sent' })
  firebase_sent: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Socket sent' })
  socket_sent: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
