import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('distributors')
export class Distributor {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'User id' })
  user_id: string;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Business name' })
  business_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Owner name' })
  owner_name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: 'Phone' })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Email' })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Gst number' })
  gst_number: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Address' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'City' })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'State' })
  state: string;

  @Column({ type: 'varchar', length: 100, default: 'India' })
  @ApiProperty({ description: 'Country' })
  country: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING_APPROVAL' })
  @ApiProperty({ description: 'Approval status' })
  approval_status: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Approved by user id' })
  approved_by_user_id: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Approved at' })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Rejected reason' })
  rejected_reason: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is active' })
  is_active: boolean;

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
