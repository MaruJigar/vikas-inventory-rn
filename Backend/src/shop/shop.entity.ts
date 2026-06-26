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
import { Salesman } from '../salesman/salesman.entity';

@Entity('shops')
@Index('idx_shops_dist_status', ['distributor_id', 'verification_status'])
@Index('idx_shops_created_at', ['created_at'])
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  @ApiPropertyOptional({ description: 'Distributor relation' })
  distributor?: Distributor;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Created by user id' })
  created_by_user_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Created by salesman id' })
  created_by_salesman_id: string;

  @ManyToOne(() => Salesman)
  @JoinColumn({ name: 'created_by_salesman_id' })
  @ApiPropertyOptional({ description: 'Created by Salesman relation' })
  created_by_salesman?: Salesman;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Name' })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Owner name' })
  owner_name: string;

  @Column({ type: 'varchar', length: 30 })
  @ApiProperty({ description: 'Phone' })
  phone: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Address' })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'City' })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'State' })
  state: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Gst number' })
  gst_number: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Location' })
  location: any;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Verification photo url' })
  verification_photo_url: string | null;

  @Column({ type: 'varchar', length: 50, default: 'VERIFIED' })
  @ApiProperty({ description: 'Verification status' })
  verification_status: string;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Last visit at' })
  last_visit_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Last order at' })
  last_order_at: Date;

  @Column({ type: 'boolean', default: true })
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
