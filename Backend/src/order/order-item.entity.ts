import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Product name snapshot' })
  product_name_snapshot: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Sku snapshot' })
  sku_snapshot: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'Manufacturer name snapshot' })
  manufacturer_name_snapshot: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Mrp' })
  mrp: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Gross line amount' })
  gross_line_amount: number;

  @Column({ type: 'varchar', length: 50, default: 'NONE' })
  @ApiProperty({ description: 'Item discount type' })
  item_discount_type: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Item discount value' })
  item_discount_value: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Item discount amount' })
  item_discount_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Net line amount' })
  net_line_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Reserved quantity' })
  reserved_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Backordered quantity' })
  backordered_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Dispatched quantity' })
  dispatched_quantity: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Delivered quantity' })
  delivered_quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'ORDERED' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
