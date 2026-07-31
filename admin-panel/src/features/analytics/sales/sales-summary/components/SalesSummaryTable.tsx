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
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No sales data available for this period.</div>;
  }

  return (
    <div className="rounded-md border bg-white mt-4 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity Sold</TableHead>
            <TableHead className="text-right">Total Revenue (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.sku || '-'}</TableCell>
              <TableCell>{item.categoryName || '-'}</TableCell>
              <TableCell className="text-right">{item.quantitySold}</TableCell>
              <TableCell className="text-right">{item.totalRevenue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
