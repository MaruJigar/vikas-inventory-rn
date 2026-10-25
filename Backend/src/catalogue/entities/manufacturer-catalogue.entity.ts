import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Manufacturer } from '../../manufacturer/manufacturer.entity';
import { User } from '../../user/user.entity';

@Entity('manufacturer_catalogues')
@Unique('uq_manufacturer_catalogues_manufacturer_id', ['manufacturer_id'])
export class ManufacturerCatalogue {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Catalogue unique identifier' })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({ description: 'Manufacturer ID' })
  manufacturer_id: string;

  @ManyToOne(() => Manufacturer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'manufacturer_id' })
  @ApiPropertyOptional({ description: 'Manufacturer relation' })
  manufacturer?: Manufacturer;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Original uploaded filename' })
  original_filename: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Stored unique filename on disk' })
  stored_filename: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Filesystem path relative to storage root' })
  file_path: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'URL path for accessing the catalogue' })
  file_url: string;

  @Column({ type: 'bigint' })
  @ApiProperty({ description: 'File size in bytes' })
  file_size_bytes: number;

  @Column({ type: 'varchar', length: 100, default: 'application/pdf' })
  @ApiProperty({ description: 'MIME type of the file' })
  mime_type: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'User ID who uploaded the catalogue' })
  uploaded_by_user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  @ApiPropertyOptional({ description: 'User relation' })
  uploaded_by_user?: User;

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: 'Catalogue creation timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty({ description: 'Catalogue last update timestamp' })
  updated_at: Date;
}
