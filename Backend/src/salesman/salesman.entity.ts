import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Distributor } from '../distributor/distributor.entity';
import { City } from '../region/entities/city.entity';
import { State } from '../region/entities/state.entity';

@Entity('salesmen')
@Index('idx_salesmen_dist_status', ['distributor_id', 'approval_status'])
@Index('idx_salesmen_created_at', ['created_at'])
export class Salesman {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'User id' })
  user_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  @ApiPropertyOptional({ description: 'Distributor relation' })
  distributor?: Distributor;

  @Column({ type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Full name' })
  full_name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: 'Phone' })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Email' })
  email: string;

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

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'City name text' })
  city_name: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'State name text' })
  state_name: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'City id' })
  city_id: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  @ApiPropertyOptional({ type: () => City, description: 'City relation' })
  city?: City;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'State id' })
  state_id: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  @ApiPropertyOptional({ type: () => State, description: 'State relation' })
  state?: State;

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
