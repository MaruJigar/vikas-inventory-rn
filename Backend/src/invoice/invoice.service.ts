import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { Manufacturer } from '../manufacturer/manufacturer.entity';
import { Distributor } from '../distributor/distributor.entity';
import { OrderService } from '../order/order.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { InvoiceTokenStore } from './invoice-token.store';
import {
  InvoiceData,
  InvoiceFinancials,
  InvoiceItem,
  InvoiceManufacturer,
  InvoiceDistributor,
} from './invoice.types';

/** Directory for temporary invoice PDF files */
const INVOICE_TEMP_DIR = path.join(os.tmpdir(), 'vikas-invoices');

/** Stale-file TTL: delete files older than 15 minutes */
const STALE_FILE_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class InvoiceService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Manufacturer) private mfrRepo: Repository<Manufacturer>,
    @InjectRepository(Distributor) private distRepo: Repository<Distributor>,
    private orderService: OrderService,
    private pdfService: InvoicePdfService,
    private tokenStore: InvoiceTokenStore,
    private configService: ConfigService,
  ) {}

  /**
   * On server start, clear any stale invoice PDFs left from a previous crash.
   * Only cleans files inside the dedicated temp directory.
   */
  onApplicationBootstrap() {
    this.ensureTempDir();
    this.cleanStaleFiles();
  }

  // ─── Cron: clean stale files every 5 minutes ──────────────────────────────

  @Cron('*/5 * * * *')
  cleanStaleFiles(): void {
    try {
      // 1. Clean expired token entries and their files
      this.tokenStore.cleanExpired();

      // 2. Safety net: scan disk for files older than TTL
      const files = fs.readdirSync(INVOICE_TEMP_DIR);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith('.pdf')) continue;
        const filePath = path.join(INVOICE_TEMP_DIR, file);
        try {
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > STALE_FILE_TTL_MS) {
            fs.unlinkSync(filePath);
            this.logger.debug(`Stale invoice file deleted: ${file}`);
          }
        } catch (fileErr) {
          this.logger.warn(`Could not stat/delete stale file ${file}: ${fileErr.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`cleanStaleFiles failed: ${err.message}`, err.stack);
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Build normalized InvoiceData from an authorized order.
   * Reuses OrderService.getOrderById() which enforces existing ownership rules.
   */
  async buildInvoiceData(
    orderId: string,
    userId: string,
    role: string,
  ): Promise<InvoiceData> {
    // Reuse existing authorization — this throws ForbiddenException if unauthorized
    const order = await this.orderService.getOrderById(userId, role, orderId);

    // Fetch manufacturer (if this is a purchase order)
    let manufacturer: Manufacturer | null = null;
    if (order.manufacturer_id) {
      manufacturer = await this.mfrRepo.findOne({
        where: { id: order.manufacturer_id },
      });
    }

    // Fetch distributor (always present on an order)
    const distributor = await this.distRepo.findOne({
      where: { id: order.distributor_id },
    });
    if (!distributor) {
      throw new NotFoundException('Distributor not found for this order');
    }

    return await this.mapToInvoiceData(order, manufacturer, distributor);
  }

  /**
   * Generate a PDF for the given InvoiceData, write it to a temp file,
   * and create a secure single-use download token.
   */
  async generateAndStore(
    data: InvoiceData,
    req: { protocol: string; hostname: string },
  ): Promise<{ token: string; filePath: string; fileName: string; downloadUrl: string }> {
    this.ensureTempDir();

    const fileName = `Proforma-Invoice-${data.invoiceNumber}.pdf`;
    const fileId = uuidv4();
    const filePath = path.join(INVOICE_TEMP_DIR, `invoice-${fileId}.pdf`);

    // Generate the PDF buffer
    const pdfBuffer = await this.pdfService.generatePdf(data);

    // Write to temp file
    fs.writeFileSync(filePath, pdfBuffer);
    this.logger.log(`Invoice PDF written: ${filePath}`);

    // Create single-use token
    const token = this.tokenStore.create(filePath);

    // Build the absolute download URL
    const baseUrl = this.resolveBaseUrl(req);
    const downloadUrl = `${baseUrl}/v1/invoices/download/${token}`;

    return { token, filePath, fileName, downloadUrl };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async mapToInvoiceData(
    order: Order,
    manufacturer: Manufacturer | null,
    distributor: Distributor,
  ): Promise<InvoiceData> {
    const items = await this.mapItems(order);
    const financials = this.mapFinancials(order);

    const mfr: InvoiceManufacturer = {
      name: manufacturer?.company_name || 'N/A',
      address: manufacturer?.address || '',
      city: manufacturer?.city || '',
      gstNumber: manufacturer?.gst_number || '',
      phone: manufacturer?.phone || '',
    };

    const dist: InvoiceDistributor = {
      name: distributor.business_name || 'N/A',
      address: distributor.address || '',
      city: distributor.city || '',
      gstNumber: distributor.gst_number || '',
      mobile: distributor.phone || '',
    };

    return {
      invoiceId: order.id,
      invoiceNumber: order.order_number,
      date: order.created_at,
      transportMode: order.transport_mode || 'N/A',
      paymentTerms: 'N/A', // No payment_terms field on Order entity currently
      remarks: '',         // No remarks field on Order entity currently

      manufacturer: mfr,
      distributor: dist,
      items,
      financials,
    };
  }

  private async mapItems(order: Order): Promise<InvoiceItem[]> {
    if (!order.items || order.items.length === 0) return [];

    const items = await Promise.all(order.items.map(async (item: OrderItem, index: number) => {
      const quantity = Number(item.quantity) || 0;
      const gross = Number(item.gross_line_amount) || 0;
      // Unit price = gross_line_amount / quantity (= MRP at order time)
      const unitPrice = quantity > 0 ? gross / quantity : Number(item.mrp) || 0;

      const unit = (item.product as any)?.unit || 'KG';
      let imageUrl: string | null = (item.product as any)?.product_image_url || null;
      let imageBase64: string | null = null;

      if (imageUrl) {
        // If image URL is a relative path, convert to absolute using app URL
        if (imageUrl.startsWith('/')) {
            const baseUrl = this.configService.get<string>('app.appBaseUrl') || 'http://localhost:3001';
            imageUrl = `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
        }
        
        try {
          const res = await fetch(imageUrl);
          if (res.ok) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = res.headers.get('content-type') || 'image/jpeg';
            imageBase64 = `data:${contentType};base64,${buffer.toString('base64')}`;
          }
        } catch (e) {
          this.logger.warn(`Failed to fetch image for item ${item.id} from ${imageUrl}: ${e.message}`);
        }
      }

      return {
        no: index + 1,
        itemNo: item.sku_snapshot || 'N/A',
        description: item.product_name_snapshot || 'N/A',
        quantity,
        unit,
        mrp: Number(item.mrp) || 0,
        unitPrice,
        amount: gross,
        imageUrl,
        imageBase64,
      };
    }));
    return items;
  }

  private mapFinancials(order: Order): InvoiceFinancials {
    const gross = Number(order.gross_order_amount) || 0;

    const distDiscPct = Number(order.distributor_discount_percent) || 0;
    const distDiscAmt = Number(order.distributor_discount_amount) || 0;

    const distMarginPct = Number(order.distributor_margin_percent) || 0;
    const distMarginAmt = Number(order.distributor_margin_amount) || 0;

    const freightPct = Number(order.freight_discount_percent) || 0;
    const freightAmt = Number(order.freight_discount_amount) || 0;

    const specialPct = Number(order.special_discount_percent) || 0;
    const specialAmt = Number(order.special_discount_amount) || 0;

    const cashPct = Number(order.cash_discount_percent) || 0;
    const cashAmt = Number(order.cash_discount_amount) || 0;

    const gst = Number(order.total_gst_amount) || 0;
    const grandTotal = Number(order.final_order_amount) || 0;

    // Taxable amount = Grand Total - GST
    const taxableAmount = grandTotal - gst;

    return {
      subTotal: gross,

      distDiscountPercent: distDiscPct,
      distDiscountAmount: distDiscAmt,

      distMarginPercent: distMarginPct,
      distMarginAmount: distMarginAmt,

      freightDiscPercent: freightPct,
      freightDiscAmount: freightAmt,

      specialDiscPercent: specialPct,
      specialDiscAmount: specialAmt,

      cashDiscPercent: cashPct,
      cashDiscAmount: cashAmt,

      taxableAmount,
      totalGst: gst,
      grandTotal,
    };
  }

  /**
   * Resolve the absolute base URL for the download link.
   * Priority: APP_BASE_URL env var → reconstruct from request.
   */
  private resolveBaseUrl(req: { protocol: string; hostname: string }): string {
    const envBaseUrl = this.configService.get<string>('app.appBaseUrl');
    if (envBaseUrl) return envBaseUrl.replace(/\/$/, '');

    // Fallback: reconstruct from the current request
    const protocol = req.protocol || 'http';
    const host = req.hostname || 'localhost';
    const port = this.configService.get<number>('app.port', 3001);

    // On VPS behind Nginx the host will be api.avchousehold.com (no port needed)
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return `${protocol}://${host}`;
    }
    return `${protocol}://${host}:${port}`;
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(INVOICE_TEMP_DIR)) {
      fs.mkdirSync(INVOICE_TEMP_DIR, { recursive: true });
      this.logger.log(`Created temp invoice directory: ${INVOICE_TEMP_DIR}`);
    }
  }
}
