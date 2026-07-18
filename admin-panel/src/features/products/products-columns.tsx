'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ProductDto } from '@/types/api/product.types';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Edit, Trash, Eye } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Extended type to handle potential backend joined fields without modifying global types
type ProductRowData = ProductDto & {
  created_at?: string;
  category?: { name: string };
};

interface ProductsColumnsProps {
  onEdit: (product: ProductDto) => void;
  onDelete: (product: ProductDto) => void;
}

export function getProductColumns({ onEdit, onDelete }: ProductsColumnsProps): ColumnDef<ProductDto>[] {
  return [
    {
      id: 'thumbnail',
      header: 'Image',
      cell: ({ row }) => {
        const url = row.original.product_image_url;
        if (!url) {
          return <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">N/A</div>;
        }
        return (
          <div className="relative h-10 w-10 overflow-hidden rounded-md border">
            <Image
              src={getImageUrl(url)}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          </div>
        );
      },
    },
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
        return <span className="text-sm">{data.category?.name || 'Uncategorized'}</span>;
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
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(data.created_at)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/products/${row.original.id}`} className="cursor-pointer flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(row.original)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
