import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('shop_duplicate_logs')
export class ShopDuplicateLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Attempted shop name' })
  attempted_shop_name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: 'Attempted phone' })
  attempted_phone: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @ApiPropertyOptional({ description: 'Attempted location' })
  attempted_location: any;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Matched shop id' })
  matched_shop_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Match type' })
  match_type: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Match score' })
  match_score: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Action taken' })
  action_taken: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Created by user id' })
  created_by_user_id: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
