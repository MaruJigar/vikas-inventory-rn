export interface InventoryReportItem {
  productName: string;
  sku: string;
  categoryName: string;
  availableQuantity: number;
  reservedQuantity: number;
  mrp: number;
  stockValue: number;
}
