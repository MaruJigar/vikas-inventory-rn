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
import { Distributor } from '../distributor/distributor.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('holidays')
@Index('idx_holidays_distributor_date', ['distributor_id', 'holiday_date'])
export class Holiday {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'Holiday calendar date (YYYY-MM-DD)' })
  holiday_date: string;

  @Column({ type: 'varchar', length: 150 })
  @ApiProperty({ description: 'Holiday name/description' })
  name: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
