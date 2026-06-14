import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { ShopImageController } from './shop-image.controller';
import { UploadedFile } from './uploaded-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadedFile])],
  providers: [UploadService],
  controllers: [ShopImageController],
  exports: [UploadService],
})
export class ShopImageModule {}
