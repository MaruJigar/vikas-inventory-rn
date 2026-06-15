import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { promises as fsPromises } from 'fs';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadedFile) private fileRepo: Repository<UploadedFile>,
  ) {}

  // Helper to map mimetype to extension
  private mimeToExt(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return map[mime] ?? 'bin';
  }

  async processAndCompressImage(
    file: Express.Multer.File,
    userId: string,
    entityType: string,
    entityId: string,
  ): Promise<UploadedFile> {
    if (!file) throw new BadRequestException('No file uploaded');

    // Generate unique file name
    const ext = this.mimeToExt(file.mimetype);
    const filename = `product_${uuidv4()}.${ext}`;
    const storageDir = '/opt/storage/uploads/products';
    const filePath = join(storageDir, filename);

    // Ensure directory exists
    await fsPromises.mkdir(storageDir, { recursive: true });
    // Write file to disk
    await fsPromises.writeFile(filePath, file.buffer);

    // Mock compression: just reuse same file for now
    const uploaded = this.fileRepo.create({
      uploaded_by_user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      file_type: 'IMAGE',
      original_file_name: file.originalname,
      file_url: `/uploads/products/${filename}`,
      compressed_file_url: `/uploads/products/${filename}`,
      mime_type: file.mimetype,
      original_size_bytes: file.size,
      compressed_size_bytes: file.size,
      compression_applied: false,
    });
    await this.fileRepo.save(uploaded);
    return uploaded;
  }
}
