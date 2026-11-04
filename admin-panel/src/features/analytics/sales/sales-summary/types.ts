export interface SalesReportItem {
  productName: string;
  sku: string;
  categoryName: string;
  quantitySold: number;
  grossAmount?: number;
  totalRevenue: number;
}

export interface SalesReportSummary {
  totalOrders: number;
  totalQuantity: number;
  grossSales: number;
  totalDiscounts: number;
  totalGst: number;
  netSales: number;
}

export interface DistributorSalesBreakdown {
  distributorId: string;
  distributorName: string;
  orderCount: number;
  totalRevenue: number;
}

export interface SalesSummaryResponseData {
  period?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  summary: SalesReportSummary;
  items: SalesReportItem[];
  distributorBreakdown?: DistributorSalesBreakdown[];
  generatedAt?: string;
}
