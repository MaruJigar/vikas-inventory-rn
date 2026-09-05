import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('manufacturer_inventory_movements')
export class ManufacturerInventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Order id' })
  order_id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Movement type' })
  movement_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Quantity change' })
  quantity_change: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Previous available quantity' })
  previous_available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New available quantity' })
  new_available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Previous reserved quantity' })
  previous_reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New reserved quantity' })
  new_reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'Previous backordered quantity' })
  previous_backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'New backordered quantity' })
  new_backordered_quantity: number;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Reason' })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Changed by user id' })
  changed_by_user_id: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;
}
