import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaxReportItem } from '@/types/api/analytics.types';

interface TaxTableProps {
  data: TaxReportItem[];
}

export function TaxTable({ data }: TaxTableProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No tax data available for this period.</div>;
  }

  return (
    <div className="rounded-md border bg-white mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GST Percent (%)</TableHead>
            <TableHead className="text-right">Taxable Amount (₹)</TableHead>
            <TableHead className="text-right">Tax Amount (₹)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{item.gstPercent}%</TableCell>
              <TableCell className="text-right">{item.taxableAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right">{item.taxAmount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
