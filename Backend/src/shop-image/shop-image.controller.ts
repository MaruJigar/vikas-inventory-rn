import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../shop/shop.entity';

@Controller('shop-images')
@UseGuards(JwtAuthGuard)
@ApiTags('ShopImage')
export class ShopImageController {
  constructor(
    private uploadService: UploadService,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
  ) {}

  @Post(':shopId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Shop Image' })
  @ApiBearerAuth('bearer')
  async uploadShopImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('shopId') shopId: string,
    @Request() req: any,
  ) {
    if (!shopId) {
      throw new NotFoundException('Shop ID is required');
    }

    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException(`Shop ${shopId} not found`);
    }

    const uploadedFile = await this.uploadService.processAndCompressImage(
      file,
      req.user.userId,
      'SHOP',
      shopId,
    );

    shop.verification_photo_url = uploadedFile.file_url;
    shop.verification_status = 'VERIFIED';
    await this.shopRepository.save(shop);

    return uploadedFile;
  }
}
