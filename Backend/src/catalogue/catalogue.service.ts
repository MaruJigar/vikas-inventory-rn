import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { ManufacturerCatalogue } from './entities/manufacturer-catalogue.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { Salesman } from '../salesman/salesman.entity';
import { ManufacturerDistributor } from '../distributor/manufacturer-distributor.entity';
import { CatalogueResponseDto } from './dto/catalogue-response.dto';
import { ManufacturerCatalogueItemDto } from './dto/manufacturer-catalogue-item.dto';
import { PublicCatalogueItemDto } from './dto/public-catalogue-item.dto';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { getUploadRoot } from '../common/utils/upload-path.util';

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

@Injectable()
export class CatalogueService {
  private readonly logger = new Logger(CatalogueService.name);

  constructor(
    @InjectRepository(ManufacturerCatalogue)
    private readonly catalogueRepo: Repository<ManufacturerCatalogue>,
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepo: Repository<Manufacturer>,
    @InjectRepository(Distributor)
    private readonly distributorRepo: Repository<Distributor>,
    @InjectRepository(Salesman)
    private readonly salesmanRepo: Repository<Salesman>,
    @InjectRepository(ManufacturerDistributor)
    private readonly manufacturerDistributorRepo: Repository<ManufacturerDistributor>,
  ) {}

  /**
   * Validates that the uploaded file is a valid PDF and does not exceed size limits.
   * Performs magic bytes inspection (%PDF) to prevent MIME-type / extension spoofing.
   */
  public validatePdfFile(file?: Express.Multer.File): void {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('No PDF file uploaded or file is empty');
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${MAX_PDF_SIZE_BYTES / (1024 * 1024)}MB`,
      );
    }

    // PDF magic bytes check (%PDF)
    const buf = file.buffer;
    const isPdfMagic =
      buf.length >= 4 &&
      buf[0] === 0x25 && // %
      buf[1] === 0x50 && // P
      buf[2] === 0x44 && // D
      buf[3] === 0x46; // F

    if (!isPdfMagic) {
      throw new BadRequestException(
        'Invalid file type: File signature verification failed. Only genuine PDF documents are accepted.',
      );
    }
  }

  /**
   * Sanitizes original filename to prevent header injection and directory traversal.
   */
  public sanitizeFilename(originalName: string): string {
    const base = path.basename(originalName || 'catalogue.pdf');
    return base.replace(/[^\w\s.-]/gi, '_');
  }

  /**
   * Maps an entity to the public response DTO.
   */
  public mapToResponseDto(entity: ManufacturerCatalogue): CatalogueResponseDto {
    return {
      id: entity.id,
      manufacturer_id: entity.manufacturer_id,
      original_filename: entity.original_filename,
      file_size_bytes: Number(entity.file_size_bytes),
      mime_type: entity.mime_type || 'application/pdf',
      download_url: `/v1/catalogues/${entity.manufacturer_id}/file?download=true`,
      view_url: `/v1/catalogues/${entity.manufacturer_id}/file`,
      is_available: true,
      uploaded_by_user_id: entity.uploaded_by_user_id,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  /**
   * Resolves the Manufacturer profile for an authenticated user.
   */
  public async getManufacturerByUserId(userId: string): Promise<Manufacturer> {
    if (!userId) {
      throw new ForbiddenException(
        'Access denied: Authenticated user is not linked to a manufacturer profile',
      );
    }
    const manufacturer = await this.manufacturerRepo.findOne({
      where: { user_id: userId },
    });
    if (!manufacturer) {
      throw new ForbiddenException(
        'Access denied: Authenticated user is not linked to a manufacturer profile',
      );
    }
    return manufacturer;
  }

  /**
   * Core logic to save or replace a catalogue.
   * Ensures atomic replacement:
   * 1. Validates file
   * 2. Writes new file to disk
   * 3. Updates or creates DB record
   * 4. Deletes old file only after DB save succeeds
   * 5. If DB fails, unlinks newly created file
   */
  public async saveOrReplaceCatalogue(
    manufacturerId: string,
    uploaderUserId: string,
    file: Express.Multer.File,
  ): Promise<CatalogueResponseDto> {
    this.validatePdfFile(file);

    const manufacturer = await this.manufacturerRepo.findOne({
      where: { id: manufacturerId },
    });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer ${manufacturerId} not found`);
    }

    const uploadRoot = getUploadRoot();
    const folder = 'catalogues';
    const dirPath = path.join(uploadRoot, folder);
    await fsPromises.mkdir(dirPath, { recursive: true });

    const storedFilename = `catalogue_${manufacturerId}_${randomUUID()}.pdf`;
    const relativePath = path.join(folder, storedFilename).replace(/\\/g, '/');
    const fullPath = path.join(uploadRoot, relativePath);

    // Write new file to disk
    await fsPromises.writeFile(fullPath, file.buffer);

    let existing = await this.catalogueRepo.findOne({
      where: { manufacturer_id: manufacturerId },
    });

    const oldFilePath = existing
      ? path.join(uploadRoot, existing.file_path)
      : null;

    try {
      const sanitizedName = this.sanitizeFilename(file.originalname);
      const fileUrl = `/v1/catalogues/${manufacturerId}/file`;

      if (existing) {
        existing.original_filename = sanitizedName;
        existing.stored_filename = storedFilename;
        existing.file_path = relativePath;
        existing.file_url = fileUrl;
        existing.file_size_bytes = file.size;
        existing.mime_type = 'application/pdf';
        existing.uploaded_by_user_id = uploaderUserId;
        existing = await this.catalogueRepo.save(existing);
      } else {
        existing = this.catalogueRepo.create({
          manufacturer_id: manufacturerId,
          original_filename: sanitizedName,
          stored_filename: storedFilename,
          file_path: relativePath,
          file_url: fileUrl,
          file_size_bytes: file.size,
          mime_type: 'application/pdf',
          uploaded_by_user_id: uploaderUserId,
        });
        existing = await this.catalogueRepo.save(existing);
      }

      // Cleanup old file safely after DB save
      if (oldFilePath && oldFilePath !== fullPath) {
        try {
          if (fs.existsSync(oldFilePath)) {
            await fsPromises.unlink(oldFilePath);
            this.logger.log(`Old catalogue file removed: ${oldFilePath}`);
          }
        } catch (unlinkErr) {
          this.logger.warn(
            `Failed to remove obsolete catalogue file: ${unlinkErr.message}`,
          );
        }
      }

      return this.mapToResponseDto(existing);
    } catch (dbErr) {
      // Rollback: delete the newly written file
      try {
        if (fs.existsSync(fullPath)) {
          await fsPromises.unlink(fullPath);
        }
      } catch (cleanupErr) {
        this.logger.error(
          `Failed to cleanup new file after DB error: ${cleanupErr.message}`,
        );
      }
      throw dbErr;
    }
  }

  /**
   * Delete catalogue for a specific manufacturer.
   * Removes DB record and unlinks file safely.
   */
  public async deleteCatalogueByManufacturerId(
    manufacturerId: string,
  ): Promise<{ success: boolean; message: string }> {
    const catalogue = await this.catalogueRepo.findOne({
      where: { manufacturer_id: manufacturerId },
    });

    if (!catalogue) {
      return { success: true, message: 'No active catalogue to delete' };
    }

    const uploadRoot = getUploadRoot();
    const filePath = path.join(uploadRoot, catalogue.file_path);

    await this.catalogueRepo.delete(catalogue.id);

    try {
      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath);
        this.logger.log(`Deleted catalogue file: ${filePath}`);
      }
    } catch (err) {
      this.logger.warn(`Could not remove file on disk: ${err.message}`);
    }

    return { success: true, message: 'Catalogue deleted successfully' };
  }

  // ─── Manufacturer Self-Service Endpoints ─────────────────────────────────

  async getOwnCatalogue(userId: string): Promise<CatalogueResponseDto | null> {
    const manufacturer = await this.getManufacturerByUserId(userId);
    const catalogue = await this.catalogueRepo.findOne({
      where: { manufacturer_id: manufacturer.id },
    });

    if (!catalogue) {
      return null;
    }
    return this.mapToResponseDto(catalogue);
  }

  async uploadOwnCatalogue(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CatalogueResponseDto> {
    const manufacturer = await this.getManufacturerByUserId(userId);
    return this.saveOrReplaceCatalogue(manufacturer.id, userId, file);
  }

  async replaceOwnCatalogue(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CatalogueResponseDto> {
    const manufacturer = await this.getManufacturerByUserId(userId);
    return this.saveOrReplaceCatalogue(manufacturer.id, userId, file);
  }

  async deleteOwnCatalogue(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const manufacturer = await this.getManufacturerByUserId(userId);
    return this.deleteCatalogueByManufacturerId(manufacturer.id);
  }

  // ─── File Streaming & Security ──────────────────────────────────────────

  async streamCatalogueFile(
    manufacturerId: string,
    res: Response,
    isDownload: boolean,
  ): Promise<void> {
    const catalogue = await this.catalogueRepo.findOne({
      where: { manufacturer_id: manufacturerId },
    });

    if (!catalogue) {
      throw new NotFoundException('Catalogue not found for this manufacturer');
    }

    const uploadRoot = getUploadRoot();
    const absolutePath = path.resolve(uploadRoot, catalogue.file_path);

    // Prevent path traversal
    if (!absolutePath.startsWith(path.resolve(uploadRoot))) {
      throw new ForbiddenException('Invalid file path detected');
    }

    if (!fs.existsSync(absolutePath)) {
      this.logger.warn(`Catalogue record exists but file missing on disk: ${absolutePath}`);
      throw new NotFoundException('Catalogue PDF file missing on server storage');
    }

    const sanitizedName = this.sanitizeFilename(catalogue.original_filename);
    const dispositionType = isDownload ? 'attachment' : 'inline';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${dispositionType}; filename="${sanitizedName}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600',
    });

    const stream = fs.createReadStream(absolutePath);
    stream.on('error', (err) => {
      this.logger.error(`Error streaming catalogue PDF: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to stream catalogue PDF' });
      }
    });

    stream.pipe(res);
  }

  // ─── Admin Overview Endpoints ───────────────────────────────────────────

  async getAllCatalogues(
    queryDto: ListQueryDto,
    currentUser: { userId: string; role: string },
  ): Promise<PaginatedResponse<ManufacturerCatalogueItemDto>> {
    const { page = 1, limit = 20, search, status } = queryDto as any;
    const skip = (page - 1) * limit;

    const qb = this.manufacturerRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect(
        ManufacturerCatalogue,
        'cat',
        'cat.manufacturer_id = m.id',
      )
      .select([
        'm.id AS manufacturer_id',
        'm.company_name AS company_name',
        'm.contact_person AS contact_person',
        'm.email AS email',
        'm.phone AS phone',
        'm.city AS city',
        'm.state AS state',
        'm.is_active AS is_active',
        'cat.id AS catalogue_id',
        'cat.original_filename AS original_filename',
        'cat.file_size_bytes AS file_size_bytes',
        'cat.mime_type AS mime_type',
        'cat.uploaded_by_user_id AS uploaded_by_user_id',
        'cat.created_at AS catalogue_created_at',
        'cat.updated_at AS catalogue_updated_at',
      ]);

    // If manufacturer admin, restrict view strictly to their own manufacturer profile
    if (currentUser.role === 'MANUFACTURER_ADMIN') {
      qb.andWhere('m.user_id = :userId', { userId: currentUser.userId });
    }

    if (search) {
      qb.andWhere(
        '(m.company_name ILIKE :search OR m.contact_person ILIKE :search OR m.email ILIKE :search OR cat.original_filename ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status === 'uploaded') {
      qb.andWhere('cat.id IS NOT NULL');
    } else if (status === 'not_uploaded') {
      qb.andWhere('cat.id IS NULL');
    }

    qb.orderBy('m.company_name', 'ASC');

    const total = await qb.getCount();
    const rawRows = await qb.offset(skip).limit(limit).getRawMany();

    const data: ManufacturerCatalogueItemDto[] = rawRows.map((r) => {
      const hasCatalogue = !!r.catalogue_id;
      let catalogue: CatalogueResponseDto | null = null;

      if (hasCatalogue) {
        catalogue = {
          id: r.catalogue_id,
          manufacturer_id: r.manufacturer_id,
          original_filename: r.original_filename,
          file_size_bytes: Number(r.file_size_bytes),
          mime_type: r.mime_type || 'application/pdf',
          download_url: `/v1/catalogues/${r.manufacturer_id}/file?download=true`,
          view_url: `/v1/catalogues/${r.manufacturer_id}/file`,
          is_available: true,
          uploaded_by_user_id: r.uploaded_by_user_id,
          created_at: r.catalogue_created_at,
          updated_at: r.catalogue_updated_at,
        };
      }

      return {
        manufacturer_id: r.manufacturer_id,
        company_name: r.company_name,
        contact_person: r.contact_person || null,
        email: r.email || null,
        phone: r.phone || null,
        city: r.city || null,
        state: r.state || null,
        is_active: r.is_active,
        has_catalogue: hasCatalogue,
        catalogue,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getCatalogueByManufacturerId(
    manufacturerId: string,
    currentUser?: { userId: string; role: string },
  ): Promise<CatalogueResponseDto | null> {
    const catalogue = await this.catalogueRepo.findOne({
      where: { manufacturer_id: manufacturerId },
    });

    if (!catalogue) {
      return null;
    }
    return this.mapToResponseDto(catalogue);
  }

  // ─── Public Catalogue Discovery ──────────────────────────────────────────

  async getPublicCatalogues(
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<PublicCatalogueItemDto>> {
    const { page = 1, limit = 20, search } = queryDto as any;
    const skip = (page - 1) * limit;

    const qb = this.catalogueRepo
      .createQueryBuilder('cat')
      .innerJoin(Manufacturer, 'm', 'm.id = cat.manufacturer_id')
      .where('m.is_active = :isActive', { isActive: true })
      .select([
        'm.id AS manufacturer_id',
        'm.company_name AS company_name',
        'm.city AS city',
        'm.state AS state',
        'cat.id AS catalogue_id',
        'cat.original_filename AS original_filename',
        'cat.file_size_bytes AS file_size_bytes',
        'cat.updated_at AS updated_at',
      ]);

    if (search) {
      qb.andWhere(
        '(m.company_name ILIKE :search OR cat.original_filename ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('m.company_name', 'ASC');

    const total = await qb.getCount();
    const rawRows = await qb.offset(skip).limit(limit).getRawMany();

    const data: PublicCatalogueItemDto[] = rawRows.map((r) => ({
      manufacturerId: r.manufacturer_id,
      manufacturerName: r.company_name,
      fileName: r.original_filename,
      fileSizeBytes: Number(r.file_size_bytes),
      updatedAt: r.updated_at,
      city: r.city || null,
      state: r.state || null,
      pdfUrl: `/v1/catalogues/${r.manufacturer_id}/file`,
      downloadUrl: `/v1/catalogues/${r.manufacturer_id}/file?download=true`,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ─── Relationship-Scoped Catalogue Discovery ─────────────────────────────

  async getAccessibleCatalogues(
    currentUser: { userId: string; role: string },
    queryDto: ListQueryDto,
  ): Promise<PaginatedResponse<PublicCatalogueItemDto>> {
    const { page = 1, limit = 20, search } = queryDto as any;
    const skip = (page - 1) * limit;

    let targetDistributorId: string | null = null;
    let allowedManufacturerIds: string[] | null = null;

    if (
      currentUser.role === 'DISTRIBUTOR_ADMIN' ||
      currentUser.role === 'DISTRIBUTOR'
    ) {
      const distributor = await this.distributorRepo.findOne({
        where: { user_id: currentUser.userId },
      });
      if (!distributor) {
        throw new ForbiddenException('Distributor profile not found');
      }
      targetDistributorId = distributor.id;
    } else if (currentUser.role === 'SALESMAN') {
      const salesman = await this.salesmanRepo.findOne({
        where: { user_id: currentUser.userId },
      });
      if (!salesman) {
        throw new ForbiddenException('Salesman profile not found');
      }
      if (!salesman.distributor_id) {
        throw new ForbiddenException('Salesman is not assigned to a distributor');
      }
      targetDistributorId = salesman.distributor_id;
    } else if (currentUser.role === 'SUPER_ADMIN') {
      // Super admin can access all catalogues
      return this.getPublicCatalogues(queryDto);
    } else if (
      currentUser.role === 'MANUFACTURER_ADMIN' ||
      currentUser.role === 'MANUFACTURER'
    ) {
      const ownMfr = await this.getManufacturerByUserId(currentUser.userId);
      allowedManufacturerIds = [ownMfr.id];
    } else {
      throw new ForbiddenException('Unauthorized to access personalized catalogues');
    }

    const qb = this.catalogueRepo
      .createQueryBuilder('cat')
      .innerJoin(Manufacturer, 'm', 'm.id = cat.manufacturer_id')
      .where('m.is_active = :isActive', { isActive: true })
      .select([
        'm.id AS manufacturer_id',
        'm.company_name AS company_name',
        'm.city AS city',
        'm.state AS state',
        'cat.id AS catalogue_id',
        'cat.original_filename AS original_filename',
        'cat.file_size_bytes AS file_size_bytes',
        'cat.updated_at AS updated_at',
      ]);

    if (targetDistributorId) {
      qb.innerJoin(
        ManufacturerDistributor,
        'md',
        'md.manufacturer_id = m.id AND md.distributor_id = :distributorId AND md.status = :status',
        { distributorId: targetDistributorId, status: 'APPROVED' },
      );
    } else if (allowedManufacturerIds && allowedManufacturerIds.length > 0) {
      qb.andWhere('m.id IN (:...mfrIds)', { mfrIds: allowedManufacturerIds });
    }

    if (search) {
      qb.andWhere(
        '(m.company_name ILIKE :search OR cat.original_filename ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('m.company_name', 'ASC');

    const total = await qb.getCount();
    const rawRows = await qb.offset(skip).limit(limit).getRawMany();

    const data: PublicCatalogueItemDto[] = rawRows.map((r) => ({
      manufacturerId: r.manufacturer_id,
      manufacturerName: r.company_name,
      fileName: r.original_filename,
      fileSizeBytes: Number(r.file_size_bytes),
      updatedAt: r.updated_at,
      city: r.city || null,
      state: r.state || null,
      pdfUrl: `/v1/catalogues/${r.manufacturer_id}/file`,
      downloadUrl: `/v1/catalogues/${r.manufacturer_id}/file?download=true`,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
