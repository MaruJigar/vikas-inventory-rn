import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';

@Controller('shop-images')
@UseGuards(JwtAuthGuard)
@ApiTags('ShopImage')
export class ShopImageController {
  constructor(private uploadService: UploadService) {}

  @Post(':shopId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload Shop Image' })
  @ApiBearerAuth('bearer')
  async uploadShopImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('shopId') shopId: string,
    @Request() req,
  ) {
    return this.uploadService.processAndCompressImage(
      file,
      req.user.userId,
      'SHOP',
      shopId,
    );
  }
}
