import { Injectable, Logger } from '@nestjs/common';
import { InvoiceData } from './invoice.types';

// Use require to bypass any strict type issues with pdfmake v0.3
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmake = require('pdfmake/build/pdfmake');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfsFonts = require('pdfmake/build/vfs_fonts');

/**
 * InvoicePdfService
 *
 * Generates a Proforma Invoice PDF buffer from a normalized InvoiceData object.
 */
@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  constructor() {
    // Load fonts into virtual file system
    pdfmake.vfs = vfsFonts.pdfMake?.vfs ?? vfsFonts;
  }

  /**
   * Generates a PDF Buffer for the given InvoiceData.
   * Supports multi-page — pdfmake automatically paginates large tables.
   */
  async generatePdf(data: InvoiceData): Promise<Buffer> {
    try {
      const docDefinition = this.buildDocDefinition(data);
      const pdfDoc = pdfmake.createPdf(docDefinition);
      return await pdfDoc.getBuffer();
    } catch (err) {
      this.logger.error('Failed to generate PDF', err);
      throw err;
    }
  }

  private fmt(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }

  private pct(value: number): string {
    return `${Number(value ?? 0).toFixed(2)}%`;
  }

  private formatDate(date: Date): string {
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(date));
    } catch {
      return String(date);
    }
  }

  private buildDocDefinition(data: InvoiceData): Record<string, unknown> {
    const { manufacturer, distributor, items, financials } = data;

    // ─── Product table rows ───────────────────────────────────────────────────
    const tableBody: unknown[][] = [
      // Header row
      [
        { text: 'No', style: 'tableHeader', alignment: 'center' },
        { text: 'ITEM NO', style: 'tableHeader', alignment: 'center' },
        { text: 'DESCRIPTION', style: 'tableHeader', alignment: 'center' },
        { text: 'ORDER QTY (KG)', style: 'tableHeader', alignment: 'center' },
        { text: 'MRP', style: 'tableHeader', alignment: 'center' },
        { text: 'UNIT PRICE', style: 'tableHeader', alignment: 'center' },
        { text: 'AMOUNT', style: 'tableHeader', alignment: 'center' },
      ],
    ];

    for (const item of items) {
      tableBody.push([
        { text: String(item.no), alignment: 'center', style: 'tableCell' },
        { text: item.itemNo || 'N/A', style: 'tableCell' },
        { text: item.description || 'N/A', style: 'tableCell' },
        { text: this.fmt(item.quantity), alignment: 'center', style: 'tableCell' },
        { text: this.fmt(item.mrp), alignment: 'right', style: 'tableCell' },
        { text: this.fmt(item.unitPrice), alignment: 'right', style: 'tableCell' },
        { text: this.fmt(item.amount), alignment: 'right', style: 'tableCell' },
      ]);
    }

    // ─── Financial breakdown rows ─────────────────────────────────────────────
    const financialRows: unknown[] = [
      this.calcRow('Sub Total:', this.fmt(financials.subTotal)),
      this.calcRow(`Dist. Discount (${this.pct(financials.distDiscountPercent)}):`, this.fmt(financials.distDiscountAmount)),
      this.calcRow(`Dist. Margin (${this.pct(financials.distMarginPercent)}):`, this.fmt(financials.distMarginAmount)),
      this.calcRow(`Freight Disc (${this.pct(financials.freightDiscPercent)}):`, this.fmt(financials.freightDiscAmount)),
      this.calcRow(`Special Disc (${this.pct(financials.specialDiscPercent)}):`, this.fmt(financials.specialDiscAmount)),
      this.calcRow(`Cash Disc (${this.pct(financials.cashDiscPercent)}):`, this.fmt(financials.cashDiscAmount)),
      this.calcRow('Taxable Amount:', this.fmt(financials.taxableAmount)),
      this.calcRow('Total GST (+):', this.fmt(financials.totalGst)),
      {
        columns: [
          { text: 'GRAND TOTAL:', bold: true, fontSize: 10 },
          { text: `${this.fmt(financials.grandTotal)}`, bold: true, fontSize: 10, alignment: 'right' },
        ],
        margin: [8, 5, 8, 5],
        fillColor: '#f9f9f9',
      },
    ];

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [28, 28, 28, 28], // ~10mm each side

      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
        color: '#111111',
      },

      styles: {
        sanskritHeader: {
          fontSize: 13,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 6],
        },
        companyName: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 8],
        },
        sectionHeading: {
          fontSize: 10,
          bold: true,
          decoration: 'underline',
          margin: [0, 0, 0, 4],
        },
        invoiceTitle: {
          fontSize: 13,
          bold: true,
          decoration: 'underline',
          alignment: 'center',
        },
        metaLabel: {
          bold: true,
          fontSize: 9,
        },
        tableHeader: {
          bold: true,
          fontSize: 8,
          fillColor: '#f5f5f5',
          margin: [2, 3, 2, 3],
        },
        tableCell: {
          fontSize: 8,
          margin: [2, 3, 2, 3],
        },
        buyerLabel: {
          bold: true,
          fontSize: 9,
        },
        buyerValue: {
          fontSize: 9,
        },
        calcLabel: {
          bold: true,
          fontSize: 9,
        },
        calcValue: {
          fontSize: 9,
          alignment: 'right',
        },
        remarksHeading: {
          bold: true,
          fontSize: 10,
          decoration: 'underline',
          margin: [0, 0, 0, 4],
        },
      },

      content: [
        // ─── Sanskrit header ────────────────────────────────────────────────
        { text: 'श्री पार्श्वनाथ नमः', style: 'sanskritHeader' },

        // ─── Main invoice border table (header grid) ────────────────────────
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                // Left column: Manufacturer + Buyer Details
                {
                  stack: [
                    { text: manufacturer.name, style: 'companyName' },
                    manufacturer.address ? { text: manufacturer.address, fontSize: 8, color: '#444' } : {},
                    manufacturer.city ? { text: manufacturer.city, fontSize: 8, color: '#444' } : {},
                    manufacturer.gstNumber ? { text: `GST: ${manufacturer.gstNumber}`, fontSize: 8, color: '#444' } : {},
                    manufacturer.phone ? { text: `Ph: ${manufacturer.phone}`, fontSize: 8, color: '#444' } : {},
                    { text: '\n' },
                    { text: 'BUYER DETAILS', style: 'sectionHeading' },
                    this.buyerRow('Name & Address', distributor.name + (distributor.address ? `, ${distributor.address}` : '')),
                    this.buyerRow('City', distributor.city || 'N/A'),
                    this.buyerRow('GST No', distributor.gstNumber || 'N/A'),
                    this.buyerRow('Mob No', distributor.mobile || 'N/A'),
                  ],
                  margin: [8, 8, 8, 8],
                },

                // Right column: Invoice title + metadata
                {
                  stack: [
                    { text: 'PROFORMA INVOICE', style: 'invoiceTitle', margin: [0, 0, 0, 8] },
                    this.metaRow('Date:', this.formatDate(data.date)),
                    this.metaRow('Invoice No:', data.invoiceNumber),
                    this.metaRow('Transport Mode:', data.transportMode),
                    this.metaRow('Payment Terms:', data.paymentTerms),
                    this.metaRow('Dist. / Name:', distributor.name),
                  ],
                  margin: [8, 8, 8, 8],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#111111',
            vLineColor: () => '#111111',
          },
          margin: [0, 0, 0, 0],
        },

        // ─── Product table ─────────────────────────────────────────────────
        {
          table: {
            headerRows: 1,
            widths: ['6%', '12%', '28%', '14%', '10%', '15%', '15%'],
            body: tableBody,
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#111111',
            vLineColor: () => '#111111',
          },
          margin: [0, 0, 0, 0],
        },

        // ─── Bottom section: Remarks (left) + Financial breakdown (right) ──
        {
          table: {
            widths: ['*', 200],
            body: [
              [
                // Remarks
                {
                  stack: [
                    { text: 'REMARKS', style: 'remarksHeading' },
                    { text: data.remarks || '', fontSize: 9, margin: [0, 4, 0, 0] },
                  ],
                  margin: [8, 8, 8, 8],
                  minHeight: 120,
                },

                // Financial breakdown
                {
                  stack: financialRows,
                  margin: [0, 0, 0, 0],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#111111',
            vLineColor: () => '#111111',
          },
          margin: [0, 0, 0, 0],
        },
      ],
    };
  }

  /** Single metadata row (label: value) for the right-column invoice metadata section */
  private metaRow(label: string, value: string): unknown {
    return {
      columns: [
        { text: label, style: 'metaLabel', width: '45%' },
        { text: value || 'N/A', width: '55%', fontSize: 9 },
      ],
      margin: [0, 3, 0, 3],
      columnGap: 4,
    };
  }

  /** Single buyer detail row (label: value) */
  private buyerRow(label: string, value: string): unknown {
    return {
      columns: [
        { text: label, style: 'buyerLabel', width: '35%' },
        { text: value || 'N/A', style: 'buyerValue', width: '65%' },
      ],
      margin: [0, 2, 0, 2],
      columnGap: 4,
    };
  }

  /** Single calculation row (label: value) for the financial breakdown */
  private calcRow(label: string, value: string): unknown {
    return {
      columns: [
        { text: label, style: 'calcLabel' },
        { text: value, style: 'calcValue' },
      ],
      margin: [8, 4, 8, 4],
    };
  }
}
