import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryReportItem } from '@/types/api/analytics.types';

interface InventoryTableProps {
  data: InventoryReportItem[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No inventory data available.</div>;
  }

  return (
    <div className="rounded-md border bg-white mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Available Qty</TableHead>
            <TableHead className="text-right">Reserved Qty</TableHead>
            <TableHead className="text-right">MRP (₹)</TableHead>
            <TableHead className="text-right">Stock Value (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.sku || '-'}</TableCell>
              <TableCell>{item.categoryName || '-'}</TableCell>
              <TableCell className="text-right">{item.availableQuantity}</TableCell>
              <TableCell className="text-right">{item.reservedQuantity}</TableCell>
              <TableCell className="text-right">{item.mrp.toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.stockValue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
