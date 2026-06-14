import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Salesman } from '../salesman/salesman.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Shop } from '../shop/shop.entity';
import { WorkingDay } from '../working-day/working-day.entity';

@Entity('shop_visits')
export class ShopVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_shop_visits_salesman')
  @Column({ type: 'uuid' })
  salesman_id: string;

  @ManyToOne(() => Salesman)
  @JoinColumn({ name: 'salesman_id' })
  salesman: Salesman;

  @Index('idx_shop_visits_distributor')
  @Column({ type: 'uuid' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Index('idx_shop_visits_shop')
  @Column({ type: 'uuid' })
  shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Index('idx_shop_visits_working_day')
  @Column({ type: 'uuid', nullable: true })
  working_day_id: string;

  @ManyToOne(() => WorkingDay)
  @JoinColumn({ name: 'working_day_id' })
  working_day: WorkingDay;

  @Column({ type: 'varchar', length: 50, nullable: true })
  visit_type: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  start_location: any;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  end_location: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  no_order_reason: string;

  @Column({ type: 'text', nullable: true })
  no_order_note: string;

  @Column({ type: 'boolean', default: false })
  is_offline_created: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  idempotency_key: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
