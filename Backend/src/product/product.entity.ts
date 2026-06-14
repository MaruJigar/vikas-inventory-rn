import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  product_source: string;

  @Column({ type: 'uuid', nullable: true })
  manufacturer_id: string;

  @Column({ type: 'uuid', nullable: true })
  distributor_id: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  product_image_url: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  mrp: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  gst_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  distributor_discount_percent: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  special_discount_percent: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  external_manufacturer_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  external_manufacturer_contact: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  external_manufacturer_phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  external_manufacturer_email: string;

  @Column({ type: 'text', nullable: true })
  external_manufacturer_address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  external_manufacturer_gst_number: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}