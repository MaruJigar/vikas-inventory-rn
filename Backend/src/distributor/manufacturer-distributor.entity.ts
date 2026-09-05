import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('manufacturer_distributors')
@Unique(['manufacturer_id', 'distributor_id'])
export class ManufacturerDistributor {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Approved by user id' })
  approved_by_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Approved at' })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Rejected reason' })
  rejected_reason: string;

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
