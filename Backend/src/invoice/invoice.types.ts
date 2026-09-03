/**
 * Normalized invoice data model.
 * Single source of truth consumed by InvoicePdfService.
 * All values are already resolved — no calculations happen at render time.
 */

export interface InvoiceManufacturer {
  name: string;
  address: string;
  city: string;
  gstNumber: string;
  phone: string;
}

export interface InvoiceDistributor {
  name: string;
  address: string;
  city: string;
  gstNumber: string;
  mobile: string;
}

export interface InvoiceItem {
  no: number;
  itemNo: string;       // SKU snapshot
  description: string;  // Product name snapshot
  quantity: number;
  unit: string;         // e.g. 'KG' or product unit
  mrp: number;
  unitPrice: number;    // gross_line_amount / quantity
  amount: number;       // gross_line_amount (authoritative backend value)
  imageUrl?: string | null;
  imageBase64?: string | null;
}

export interface InvoiceFinancials {
  subTotal: number;

  stdDiscountPercent: number;
  stdDiscountAmount: number;

  distDiscountPercent: number;
  distDiscountAmount: number;

  distMarginPercent: number;
  distMarginAmount: number;

  freightDiscPercent: number;
  freightDiscAmount: number;

  specialDiscPercent: number;
  specialDiscAmount: number;

  cashDiscPercent: number;
  cashDiscAmount: number;

  taxableAmount: number;
  totalGst: number;
  grandTotal: number;
}

export interface InvoiceData {
  invoiceId: string;          // order id
  invoiceNumber: string;      // order_number
  date: Date;                 // order created_at (UTC stored)
  transportMode: string;      // 'N/A' if absent
  paymentTerms: string;       // 'N/A' — no payment terms field yet
  remarks: string;            // empty string if absent

  manufacturer: InvoiceManufacturer;
  distributor: InvoiceDistributor;
  items: InvoiceItem[];
  financials: InvoiceFinancials;
}
