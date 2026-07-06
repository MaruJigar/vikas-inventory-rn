import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { ProductCategory } from './product-category.entity';
import { User } from '../user/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('products')
@Index('idx_products_mfr_cat', ['manufacturer_id', 'category_id'])
@Index('idx_products_created_at', ['created_at'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Product source' })
  product_source: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Manufacturer id' })
  manufacturer_id: string;

  @ManyToOne(() => Manufacturer)
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Distributor id' })
  distributor_id: string;

  @ManyToOne(() => Distributor)
  @JoinColumn({ name: 'distributor_id' })
  distributor: Distributor;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Category id' })
  category_id: string;

  @ManyToOne(() => ProductCategory)
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: 'Name' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Sku' })
  sku: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Unit' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Description' })
  description: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Product image url' })
  product_image_url: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Mrp' })
  mrp: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Gst percent' })
  gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Distributor discount percent' })
  distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  @ApiProperty({ description: 'Special discount percent' })
  special_discount_percent: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer name' })
  external_manufacturer_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer contact' })
  external_manufacturer_contact: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer phone' })
  external_manufacturer_phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer email' })
  external_manufacturer_email: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer address' })
  external_manufacturer_address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'External manufacturer gst number' })
  external_manufacturer_gst_number: string;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Is active' })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Created by user id' })
  created_by_user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user: User;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  @DeleteDateColumn()
  @ApiProperty({ description: 'Deleted at' })
  deleted_at: Date;
}
