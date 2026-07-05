import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Distributor } from '../distributor/distributor.entity';
import { Shop } from '../shop/shop.entity';
import { User } from '../user/user.entity';
import { City } from '../region/entities/city.entity';
import { State } from '../region/entities/state.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('shop_duplicate_logs')
export class ShopDuplicateLog {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Attempted shop name' })
  attempted_shop_name: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: 'Attempted phone' })
  attempted_phone: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Attempted city id' })
  attempted_city_id: string;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'attempted_city_id' })
  @ApiPropertyOptional({ type: () => City, description: 'Attempted city relation' })
  attempted_city?: City;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Attempted state id' })
  attempted_state_id: string;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'attempted_state_id' })
  @ApiPropertyOptional({ type: () => State, description: 'Attempted state relation' })
  attempted_state?: State;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Matched shop id' })
  matched_shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: 'matched_shop_id' })
  matched_shop: Shop;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user: User;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
