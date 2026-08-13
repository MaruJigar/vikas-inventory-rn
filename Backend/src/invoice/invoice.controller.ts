import {
  Controller,
  Get,
  Param,
  Request,
  Res,
  UseGuards,
  NotFoundException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../role-permission/roles.guard';
import { InvoiceService } from './invoice.service';
import { InvoiceTokenStore } from './invoice-token.store';

/**
 * InvoiceController
 *
 * Provides two endpoints:
 *
 * 1. GET /v1/orders/:orderId/invoice/pdf
 *    Authenticated + authorized. Generates a temporary PDF and returns a
 *    secure single-use downloadUrl.
 *
 * 2. GET /v1/invoices/download/:token
 *    No JWT guard — the opaque UUID token IS the auth credential.
 *    Serves the PDF once and then deletes the temp file + invalidates the token.
 */
@ApiTags('Invoice')
@Controller()
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly tokenStore: InvoiceTokenStore,
  ) {}

  // ─── Generate Invoice PDF ─────────────────────────────────────────────────

  @Get('orders/:orderId/invoice/pdf')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Generate Proforma Invoice PDF for an order',
    description:
      'Generates a temporary Proforma Invoice PDF from the existing authorized order data. ' +
      'Returns a secure single-use downloadUrl valid for 15 minutes. ' +
      'Accessible by any role that can view the order (SUPER_ADMIN, DISTRIBUTOR_ADMIN, MANUFACTURER_ADMIN, SALESMAN).',
  })
  @ApiParam({ name: 'orderId', description: 'UUID of the order' })
  @HttpCode(HttpStatus.OK)
  async generateInvoicePdf(
    @Request() req: ExpressRequest & { user: { userId: string; role: string } },
    @Param('orderId') orderId: string,
  ) {
    const { userId, role } = req.user;

    // Build normalized invoice data (reuses existing order ownership checks)
    const invoiceData = await this.invoiceService.buildInvoiceData(orderId, userId, role);

    // Generate PDF and store temporarily
    const { fileName, downloadUrl } = await this.invoiceService.generateAndStore(
      invoiceData,
      { protocol: req.protocol, hostname: req.hostname },
    );

    return {
      success: true,
      data: {
        invoiceId: invoiceData.invoiceId,
        invoiceNumber: invoiceData.invoiceNumber,
        fileName,
        mimeType: 'application/pdf',
        downloadUrl,
      },
    };
  }

  // ─── Download Temporary PDF ────────────────────────────────────────────────

  /**
   * Serves the temporary invoice PDF by token.
   *
   * Security model:
   * - Token is a UUID v4 (cryptographically random, not guessable).
   * - Token is single-use — consumed immediately on first valid request.
   * - Token expires after 15 minutes even if never used.
   * - No JWT guard — token itself is the short-lived credential.
   *
   * Lifecycle:
   * - consume(token) atomically returns filePath and deletes the token entry.
   * - PDF is streamed to client.
   * - After response finishes (success or error), the temp file is deleted.
   */
  @Get('invoices/download/:token')
  @ApiOperation({
    summary: 'Download a temporary invoice PDF by secure token (no auth required)',
    description:
      'Single-use endpoint. The token is returned by the invoice generation endpoint. ' +
      'Valid for 15 minutes, usable once. After serving, the temp PDF is deleted.',
  })
  @ApiParam({ name: 'token', description: 'Single-use UUID download token' })
  async downloadInvoice(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    // Consume the token atomically
    const filePath = this.tokenStore.consume(token);

    if (!filePath) {
      throw new NotFoundException('Invoice not found or link has expired. Please generate a new invoice.');
    }

    // Verify the file still exists on disk
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`Token valid but file missing: ${filePath}`);
      throw new NotFoundException('Invoice file not found. Please generate a new invoice.');
    }

    // Derive a human-friendly filename from the path
    const fileBaseName = `Proforma-Invoice.pdf`;

    // Schedule file deletion after the response is complete
    const cleanup = () => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.log(`Temp invoice deleted: ${filePath}`);
        }
      } catch (err) {
        this.logger.warn(`Failed to delete temp invoice: ${filePath} — ${err.message}`);
      }
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);
    res.on('error', cleanup);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileBaseName}"`,
      'Cache-Control': 'no-store, no-cache',
      'Pragma': 'no-cache',
    });

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      this.logger.error(`Error streaming invoice PDF: ${err.message}`);
      cleanup();
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to stream invoice PDF' });
      }
    });

    fileStream.pipe(res);
  }
}
