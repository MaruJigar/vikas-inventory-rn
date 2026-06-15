'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProductDto } from '@/types/api/product.types';

// Extended type to handle potential backend joined fields without modifying global types
type ProductRowData = ProductDto & {
  created_at?: string;
  category?: { name: string };
};

export function getProductColumns(): ColumnDef<ProductDto>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.sku || '—'}</span>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const data = row.original as ProductRowData;
        return <span className="text-sm">{data.category?.name || data.category_id || '—'}</span>;
      },
    },
    {
      accessorKey: 'mrp',
      header: 'MRP',
      cell: ({ row }) => (
        <span className="font-mono text-sm">₹{Number(row.original.mrp).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'gst_percent',
      header: 'GST %',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.gst_percent ?? 0}%</span>
      ),
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: ({ row }) => {
        const data = row.original as ProductRowData;
        if (!data.created_at) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(data.created_at).toLocaleDateString()}
          </span>
        );
      },
    },
  ];
}
