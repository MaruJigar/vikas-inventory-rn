import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('product_price_history')
export class ProductPriceHistory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Old mrp' })
  old_mrp: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New mrp' })
  new_mrp: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Old gst percent' })
  old_gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New gst percent' })
  new_gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Old distributor discount percent' })
  old_distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New distributor discount percent' })
  new_distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Old special discount percent' })
  old_special_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New special discount percent' })
  new_special_discount_percent: number;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Changed by user id' })
  changed_by_user_id: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Reason' })
  reason: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
