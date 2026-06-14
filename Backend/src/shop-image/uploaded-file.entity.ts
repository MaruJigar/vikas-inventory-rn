import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('uploaded_files')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by_user_id: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  file_type: string;

  @Column({ type: 'text', nullable: true })
  original_file_name: string;

  @Column({ type: 'text' })
  file_url: string;

  @Column({ type: 'text', nullable: true })
  compressed_file_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mime_type: string;

  @Column({ type: 'bigint', nullable: true })
  original_size_bytes: number;

  @Column({ type: 'bigint', nullable: true })
  compressed_size_bytes: number;

  @Column({ type: 'boolean', default: true })
  compression_applied: boolean;

  @CreateDateColumn()
  created_at: Date;
}