import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { UploadService } from '../shop-image/upload.service';
import { UploadProductImageResponseDto } from './dto/upload-product-image-response.dto';

@Controller('uploads/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Product')
export class ProductImageController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload a product image.
   * Roles: MANUFACTURER_ADMIN, DISTRIBUTOR_ADMIN
   * Consumes: multipart/form-data  field: image
   * Returns: { url: string }
   */
  @Roles('MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload Product Image' })
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product image file (JPEG, PNG, WEBP — max 5 MB)',
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Product image file',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: UploadProductImageResponseDto,
    description:
      'Image uploaded successfully. Use the returned URL as product_image_url.',
  })
  @ApiBadRequestResponse({
    description: 'No file uploaded or unsupported file type',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { userId: string } },
  ): Promise<UploadProductImageResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Provide a file in the "image" field.',
      );
    }

    const mimeType = file.mimetype ?? '';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        `Unsupported file type: ${mimeType}. Allowed: jpeg, png, webp.`,
      );
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        'File exceeds maximum allowed size of 5 MB.',
      );
    }

    const uploaded = await this.uploadService.processAndCompressImage(
      file,
      req.user.userId,
      'PRODUCT',
      'pending', // No product id at upload time; URL is stored on the product record after creation
    );

    return { url: uploaded.file_url };
  }
}
