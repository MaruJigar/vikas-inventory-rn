import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SalesReportItem } from '../types';

interface SalesSummaryTableProps {
  data: SalesReportItem[];
}

export function SalesSummaryTable({ data }: SalesSummaryTableProps) {
  const items = Array.isArray(data) ? data : [];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border rounded-lg shadow-sm">
        No sales data available for this period.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b font-semibold text-gray-900 text-sm">
        Product-Wise Sales Performance ({items.length} SKUs)
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity Sold</TableHead>
              <TableHead className="text-right">Gross Amount (₹)</TableHead>
              <TableHead className="text-right">Total Net Revenue (₹)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={item.sku || i} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium text-gray-900">{item.productName}</TableCell>
                <TableCell className="font-mono text-xs text-gray-600">{item.sku || '—'}</TableCell>
                <TableCell className="text-gray-600">{item.categoryName || '—'}</TableCell>
                <TableCell className="text-right font-medium">{Number(item.quantitySold || 0).toLocaleString()}</TableCell>
                <TableCell className="text-right text-gray-600">
                  ₹{Number(item.grossAmount ?? item.totalRevenue ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900">
                  ₹{Number(item.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
