import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('working_days')
@Index('idx_unique_active_wd', ['salesman_id'], {
  unique: true,
  where: "status = 'ACTIVE'",
})
@Index('idx_wd_salesman_check_in', ['salesman_id', 'check_in_at'])
export class WorkingDay {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Salesman id' })
  salesman_id: string;

  @ManyToOne(() => Salesman)
  @JoinColumn({ name: 'salesman_id' })
  salesman: Salesman;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Check in at' })
  check_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Check out at' })
  check_out_at: Date;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Check in location' })
  check_in_location: any;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Check out location' })
  check_out_location: any;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'Device id' })
  device_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
