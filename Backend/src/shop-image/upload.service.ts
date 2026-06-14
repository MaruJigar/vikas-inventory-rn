import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadedFile) private fileRepo: Repository<UploadedFile>,
  ) {}

  async processAndCompressImage(file: Express.Multer.File, userId: string, entityType: string, entityId: string) {
    if (!file) throw new BadRequestException('No file uploaded');

    // MOCK COMPRESSION LOGIC
    const compressedUrl = `/uploads/compressed_${file.originalname}`;
    const compressedSize = Math.floor(file.size * 0.5);

    const uploaded = this.fileRepo.create({
      uploaded_by_user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      file_type: 'IMAGE',
      original_file_name: file.originalname,
      file_url: `/uploads/${file.originalname}`,
      compressed_file_url: compressedUrl,
      mime_type: file.mimetype,
      original_size_bytes: file.size,
      compressed_size_bytes: compressedSize,
      compression_applied: true,
    });

    await this.fileRepo.save(uploaded);
    return uploaded;
  }
}
