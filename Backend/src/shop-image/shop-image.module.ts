import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { ShopImageController } from './shop-image.controller';
import { UploadedFile } from './uploaded-file.entity';
import { Shop } from '../shop/shop.entity';
import { ImageCleanupService } from './image-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile, Shop])],
  providers: [UploadService, ImageCleanupService],
  controllers: [ShopImageController],
  exports: [UploadService],
})
export class ShopImageModule {}
