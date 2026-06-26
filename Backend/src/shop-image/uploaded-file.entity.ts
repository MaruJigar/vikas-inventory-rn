import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Id' })
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Uploaded by user id' })
  uploaded_by_user_id: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  @ApiPropertyOptional({ description: 'Entity type' })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: 'Entity id' })
  entity_id: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  @ApiPropertyOptional({ description: 'File type' })
  file_type: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Original file name' })
  original_file_name: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'File url' })
  file_url: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: 'Compressed file url' })
  compressed_file_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: 'Mime type' })
  mime_type: string;

  @Column({ type: 'bigint', nullable: true })
  @ApiPropertyOptional({ description: 'Original size bytes' })
  original_size_bytes: number;

  @Column({ type: 'bigint', nullable: true })
  @ApiPropertyOptional({ description: 'Compressed size bytes' })
  compressed_size_bytes: number;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Compression applied' })
  compression_applied: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  @ApiPropertyOptional({ description: 'Cleanup after date' })
  cleanup_after: Date | null;
}
