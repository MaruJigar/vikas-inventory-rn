import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { Roles } from '../role-permission/roles.decorator';
import { CatalogueService } from './catalogue.service';
import { CatalogueResponseDto } from './dto/catalogue-response.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';

@ApiTags('Manufacturer Catalogue')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearer')
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  // ─── Manufacturer Self-Service Endpoints ─────────────────────────────────

  @Get('manufacturer/catalogue')
  @Roles('MANUFACTURER_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Get Authenticated Manufacturer Catalogue Metadata',
    description:
      'Retrieves the catalogue metadata for the currently authenticated manufacturer.',
  })
  @ApiOkResponse({ type: CatalogueResponseDto })
  async getOwnCatalogue(@Request() req): Promise<CatalogueResponseDto> {
    const result = await this.catalogueService.getOwnCatalogue(req.user.userId);
    if (!result) {
      throw new NotFoundException('No catalogue uploaded for this manufacturer');
    }
    return result;
  }

  @Post('manufacturer/catalogue')
  @Roles('MANUFACTURER_ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    }),
  )
  @ApiOperation({
    summary: 'Upload PDF Catalogue for Authenticated Manufacturer',
    description:
      'Accepts a single PDF file (max 25MB). Validates file signature, stores securely, and links to the manufacturer.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Catalogue PDF document',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: CatalogueResponseDto })
  async uploadOwnCatalogue(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CatalogueResponseDto> {
    return this.catalogueService.uploadOwnCatalogue(req.user.userId, file);
  }

  @Put('manufacturer/catalogue')
  @Roles('MANUFACTURER_ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    }),
  )
  @ApiOperation({
    summary: 'Replace PDF Catalogue for Authenticated Manufacturer',
    description:
      'Replaces the existing PDF catalogue with a new one. Safely deletes old file only upon successful database update.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New catalogue PDF document to replace existing one',
        },
      },
    },
  })
  @ApiOkResponse({ type: CatalogueResponseDto })
  async replaceOwnCatalogue(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CatalogueResponseDto> {
    return this.catalogueService.replaceOwnCatalogue(req.user.userId, file);
  }

  @Delete('manufacturer/catalogue')
  @Roles('MANUFACTURER_ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Authenticated Manufacturer Catalogue',
    description:
      'Removes the active catalogue record and safely removes the physical file from disk.',
  })
  async deleteOwnCatalogue(@Request() req) {
    return this.catalogueService.deleteOwnCatalogue(req.user.userId);
  }

  @Get('manufacturer/catalogue/file')
  @Roles('MANUFACTURER_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'View or Download Authenticated Manufacturer Catalogue PDF',
    description:
      'Streams the catalogue PDF. Set query param ?download=true to force file download.',
  })
  @ApiQuery({
    name: 'download',
    required: false,
    type: Boolean,
    description: 'If true, sends Content-Disposition: attachment for download',
  })
  async serveOwnCatalogueFile(
    @Request() req,
    @Res() res: Response,
    @Query('download') download?: string,
  ) {
    const manufacturer = await this.catalogueService.getManufacturerByUserId(
      req.user.userId,
    );
    const isDownload = download === 'true' || download === '1';
    await this.catalogueService.streamCatalogueFile(
      manufacturer.id,
      res,
      isDownload,
    );
  }

  // ─── Admin Overview & Management Endpoints ──────────────────────────────

  @Get('catalogues')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({
    summary: 'List Manufacturers and Catalogue Status',
    description:
      'Returns a paginated list of manufacturers with their catalogue status and metadata.',
  })
  async getAllCatalogues(
    @Request() req,
    @Query() query: ListQueryDto,
  ) {
    return this.catalogueService.getAllCatalogues(query, {
      userId: req.user.userId,
      role: req.user.role,
    });
  }

  @Get('catalogues/:manufacturerId')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @ApiOperation({
    summary: 'Get Catalogue Metadata by Manufacturer ID',
  })
  @ApiParam({ name: 'manufacturerId', description: 'UUID of the manufacturer' })
  async getCatalogueByManufacturerId(
    @Request() req,
    @Param('manufacturerId') manufacturerId: string,
  ) {
    const result = await this.catalogueService.getCatalogueByManufacturerId(
      manufacturerId,
      {
        userId: req.user.userId,
        role: req.user.role,
      },
    );
    if (!result) {
      throw new NotFoundException('Catalogue not found for this manufacturer');
    }
    return result;
  }

  @Get('catalogues/:manufacturerId/file')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN', 'SALESMAN')
  @ApiOperation({
    summary: 'View or Download Catalogue PDF by Manufacturer ID',
    description:
      'Streams the catalogue PDF for a specific manufacturer. Supports inline viewing and attachment download.',
  })
  @ApiParam({ name: 'manufacturerId', description: 'UUID of the manufacturer' })
  @ApiQuery({
    name: 'download',
    required: false,
    type: Boolean,
    description: 'If true, sends Content-Disposition: attachment',
  })
  async serveCatalogueFile(
    @Request() req,
    @Param('manufacturerId') manufacturerId: string,
    @Res() res: Response,
    @Query('download') download?: string,
  ) {
    // If user is MANUFACTURER_ADMIN, ensure they only access their own
    if (req.user.role === 'MANUFACTURER_ADMIN') {
      const ownMfr = await this.catalogueService.getManufacturerByUserId(
        req.user.userId,
      );
      if (ownMfr.id !== manufacturerId) {
        throw new NotFoundException('Catalogue not found');
      }
    }

    const isDownload = download === 'true' || download === '1';
    await this.catalogueService.streamCatalogueFile(
      manufacturerId,
      res,
      isDownload,
    );
  }

  @Post('catalogues/:manufacturerId')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    }),
  )
  @ApiOperation({
    summary: 'Upload or Replace Catalogue for a Manufacturer',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'manufacturerId', description: 'UUID of the manufacturer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Catalogue PDF file',
        },
      },
    },
  })
  async adminUploadCatalogue(
    @Request() req,
    @Param('manufacturerId') manufacturerId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    if (req.user?.role === 'MANUFACTURER_ADMIN') {
      const ownMfr = await this.catalogueService.getManufacturerByUserId(
        userId,
      );
      if (ownMfr.id !== manufacturerId) {
        throw new ForbiddenException(
          'Access denied: You can only upload a catalogue for your own manufacturer',
        );
      }
    }

    return this.catalogueService.saveOrReplaceCatalogue(
      manufacturerId,
      userId,
      file,
    );
  }

  @Delete('catalogues/:manufacturerId')
  @Roles('SUPER_ADMIN', 'MANUFACTURER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete Catalogue for a Manufacturer',
  })
  @ApiParam({ name: 'manufacturerId', description: 'UUID of the manufacturer' })
  async adminDeleteCatalogue(
    @Request() req,
    @Param('manufacturerId') manufacturerId: string,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    if (req.user?.role === 'MANUFACTURER_ADMIN') {
      const ownMfr = await this.catalogueService.getManufacturerByUserId(
        userId,
      );
      if (ownMfr.id !== manufacturerId) {
        throw new ForbiddenException(
          'Access denied: You can only delete a catalogue for your own manufacturer',
        );
      }
    }

    return this.catalogueService.deleteCatalogueByManufacturerId(manufacturerId);
  }
}
