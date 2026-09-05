import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Actor user id' })
  actor_user_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Actor role' })
  actor_role: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Action' })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({ description: 'Entity type' })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Entity id' })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Old value' })
  old_value: any;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'New value' })
  new_value: any;

  @Column({ type: 'jsonb', nullable: true })
  @ApiPropertyOptional({ description: 'Metadata' })
  metadata: any;

  @Column({ type: 'varchar', length: 80, nullable: true })
  @ApiPropertyOptional({ description: 'Ip address' })
  ip_address: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Device id' })
  device_id: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Location' })
  location: any;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
