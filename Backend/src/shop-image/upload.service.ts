import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { promises as fsPromises } from 'fs';
import * as fs from 'fs';

import { getUploadRoot } from '../common/utils/upload-path.util';

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
    entityId: string | null,
  ): Promise<UploadedFile> {
    if (!file) throw new BadRequestException('No file uploaded');

    // Generate unique file name
    const ext = this.mimeToExt(file.mimetype);

    const ENTITY_FOLDER_MAP = {
      PRODUCT: 'products',
      SHOP: 'shops',
      USER: 'users',
      DOCUMENT: 'documents',
      MANUFACTURER: 'manufacturers',
      DISTRIBUTOR: 'distributors',
    } as const;

    const folder =
      ENTITY_FOLDER_MAP[entityType as keyof typeof ENTITY_FOLDER_MAP] ?? 'misc';

    const prefix = entityType ? entityType.toLowerCase() : 'misc';
    const filename = `${prefix}_${uuidv4()}.${ext}`;

    const relativePath = join(folder, filename);
    const dirPath = join(getUploadRoot(), folder);
    const filePath = join(getUploadRoot(), relativePath);

    // Ensure directory exists
    await fsPromises.mkdir(dirPath, { recursive: true });
    // Write file to disk
    await fsPromises.writeFile(filePath, file.buffer);

    // If uploading for a shop, cleanup existing files
    if (entityType === 'SHOP' && entityId) {
      const oldFiles = await this.fileRepo.find({
        where: { entity_type: 'SHOP', entity_id: entityId },
      });

      for (const oldFile of oldFiles) {
        if (oldFile.file_url) {
          // file_url is e.g. /uploads/shops/misc_UUID.jpg
          // We need to resolve the local path from getUploadRoot() + rest
          const oldRelativePath = oldFile.file_url.replace('/uploads/', '');
          const oldFilePath = join(getUploadRoot(), oldRelativePath);
          try {
            if (fs.existsSync(oldFilePath)) {
              await fsPromises.unlink(oldFilePath);
            }
          } catch (err) {
            console.error('Failed to delete old file:', err);
          }
        }
        await this.fileRepo.delete(oldFile.id);
      }
    }

    // Ensure POSIX-style URL separators even on Windows
    const fileUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

    // Mock compression: just reuse same file for now
    const uploaded = this.fileRepo.create({
      uploaded_by_user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      file_type: 'IMAGE',
      original_file_name: file.originalname,
      file_url: fileUrl,
      compressed_file_url: fileUrl,
      mime_type: file.mimetype,
      original_size_bytes: file.size,
      compressed_size_bytes: file.size,
      compression_applied: false,
    });
    await this.fileRepo.save(uploaded);
    return uploaded;
  }
}
