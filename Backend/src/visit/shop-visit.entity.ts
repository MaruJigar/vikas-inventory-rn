import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Shop } from '../shop/shop.entity';
import { WorkingDay } from '../working-day/working-day.entity';
import { Order } from '../order/order.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('shop_visits')
@Index('idx_visits_dist_status', ['distributor_id', 'status'])
@Index('idx_visits_salesman_status', ['salesman_id', 'status'])
@Index('idx_visits_created_at', ['created_at'])
export class ShopVisit {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Index('idx_shop_visits_salesman')
  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Salesman id' })
  salesman_id: string;

  @ManyToOne(() => Salesman)
  @JoinColumn({ name: 'salesman_id' })
  @ApiProperty({ description: 'Salesman' })
  salesman: Salesman;

  @Index('idx_shop_visits_distributor')
  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  @ApiProperty({ description: 'Distributor' })
  distributor: Distributor;

  @Index('idx_shop_visits_shop')
  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Shop id' })
  shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  @ApiProperty({ description: 'Shop' })
  shop: Shop;

  @Index('idx_shop_visits_working_day')
  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Working day id' })
  working_day_id: string;

  @ManyToOne(() => WorkingDay)
  @JoinColumn({ name: 'working_day_id' })
  @ApiProperty({ description: 'Working day' })
  working_day: WorkingDay;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Visit type' })
  visit_type: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Started at' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Ended at' })
  ended_at: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Start location' })
  start_location: any;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'End location' })
  end_location: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'No order reason' })
  no_order_reason: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'No order note' })
  no_order_note: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Is offline created' })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Idempotency key' })
  idempotency_key: string;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @OneToMany(() => Order, order => order.visit)
  orders: Order[];
}
