import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('shop_duplicate_logs')
export class ShopDuplicateLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  distributor_id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  attempted_shop_name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  attempted_phone: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  attempted_location: any;

  @Column({ type: 'uuid', nullable: true })
  matched_shop_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  match_type: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  match_score: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  action_taken: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;
}