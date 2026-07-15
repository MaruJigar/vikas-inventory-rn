import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('manufacturer_inventory')
@Unique(['manufacturer_id', 'product_id'])
@Index('idx_mfr_inventory_prod', ['manufacturer_id', 'product_id'])
export class ManufacturerInventory {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Available quantity' })
  available_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Reserved quantity' })
  reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Backordered quantity' })
  backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Low stock threshold' })
  low_stock_threshold: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
