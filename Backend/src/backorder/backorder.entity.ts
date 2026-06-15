import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('backorders')
export class Backorder {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order id' })
  order_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Order item id' })
  order_item_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Product id' })
  product_id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Distributor id' })
  distributor_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, default: 'OPEN' })
  @ApiProperty({ description: 'Status' })
  status: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  @ApiProperty({ description: 'Resolved quantity' })
  resolved_quantity: number;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Resolved at' })
  resolved_at: Date;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
}
