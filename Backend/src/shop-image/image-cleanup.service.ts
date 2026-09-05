import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { UploadedFile } from './uploaded-file.entity';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { getUploadRoot } from '../common/utils/upload-path.util';

@Injectable()
export class ImageCleanupService {
  private readonly logger = new Logger(ImageCleanupService.name);

  constructor(
    @InjectRepository(UploadedFile)
    private readonly fileRepo: Repository<UploadedFile>,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_2AM) // Disabled per user request to prevent automatic image deletion
  async handleCron() {
    this.logger.log('Starting scheduled image cleanup job...');
    await this.cleanupExpiredFiles();
    await this.cleanupAbandonedUploads();
    this.logger.log('Image cleanup job finished.');
  }

  async cleanupExpiredFiles() {
    try {
      const now = new Date();
      
      const expiredFiles = await this.fileRepo.find({
        where: {
          cleanup_after: LessThanOrEqual(now),
        },
      });

      if (expiredFiles.length === 0) {
        this.logger.log('No expired files found for cleanup.');
        return;
      }

      this.logger.log(`Found ${expiredFiles.length} expired files to clean up.`);

      for (const file of expiredFiles) {
        if (file.file_url) {
          const relativePath = file.file_url.replace('/uploads/', '');
          const filePath = join(getUploadRoot(), relativePath);

          try {
            if (fs.existsSync(filePath)) {
              await fsPromises.unlink(filePath);
              this.logger.debug(`Deleted physical file: ${filePath}`);
            } else {
              this.logger.debug(`Physical file missing, skipping: ${filePath}`);
            }
          } catch (err) {
            this.logger.error(`Failed to delete physical file: ${filePath}`, err);
          }
        }

        await this.fileRepo.delete(file.id);
        this.logger.debug(`Deleted UploadedFile record: ${file.id}`);
      }

    } catch (error) {
      this.logger.error('Error during expired files cleanup:', error);
    }
  }

  async cleanupAbandonedUploads() {
    try {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const abandonedFiles = await this.fileRepo.find({
        where: {
          entity_type: 'PRODUCT',
          entity_id: IsNull(),
          created_at: LessThanOrEqual(yesterday),
        },
      });

      if (abandonedFiles.length === 0) {
        this.logger.log('No abandoned uploads found for cleanup.');
        return;
      }

      this.logger.log(
        `Found ${abandonedFiles.length} abandoned uploads to clean up.`,
      );

      for (const file of abandonedFiles) {
        if (file.file_url) {
          const relativePath = file.file_url.replace('/uploads/', '');
          const filePath = join(getUploadRoot(), relativePath);

          try {
            if (fs.existsSync(filePath)) {
              await fsPromises.unlink(filePath);
              this.logger.debug(`Deleted physical file: ${filePath}`);
            } else {
              this.logger.debug(`Physical file missing, skipping: ${filePath}`);
            }
          } catch (err) {
            this.logger.error(
              `Failed to delete physical file: ${filePath}`,
              err,
            );
          }
        }

        await this.fileRepo.delete(file.id);
        this.logger.debug(`Deleted UploadedFile record: ${file.id}`);
      }
    } catch (error) {
      this.logger.error('Error during abandoned uploads cleanup:', error);
    }
  }
}
