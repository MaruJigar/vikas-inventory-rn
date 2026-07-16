// Note: We'll use our own ColumnDef from tanstack table
import { ColumnDef as TableColumnDef } from '@tanstack/react-table';
import { InventoryDto } from '@/types/api/inventory.types';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GetColumnsProps {
  onAdjustStock: (inventory: InventoryDto) => void;
  currentRole: string;
}

export const getInventoryColumns = ({ onAdjustStock, currentRole }: GetColumnsProps): TableColumnDef<InventoryDto>[] => [
  {
    accessorKey: 'product.name',
    header: 'Product Name',
    cell: ({ row }) => {
      const name = row.original.product?.name || 'Unknown Product';
      return <div className="font-medium text-slate-900">{name}</div>;
    },
  },
  {
    accessorKey: 'product.sku',
    header: 'SKU',
    cell: ({ row }) => row.original.product?.sku || '-',
  },
  {
    accessorKey: 'available_quantity',
    header: 'Available',
    cell: ({ row }) => {
      const qty = row.original.available_quantity;
      return (
        <Badge variant={qty > 0 ? 'default' : 'destructive'} className="font-semibold">
          {qty} {row.original.product?.unit}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'reserved_quantity',
    header: 'Reserved',
    cell: ({ row }) => row.original.reserved_quantity || 0,
  },
  {
    accessorKey: 'backordered_quantity',
    header: 'Backordered',
    cell: ({ row }) => row.original.backordered_quantity || 0,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const isOwner = currentRole === 'SUPER_ADMIN' ||
        (currentRole === 'MANUFACTURER_ADMIN' && !!row.original.product?.manufacturer_id) ||
        (currentRole === 'DISTRIBUTOR_ADMIN' && !!row.original.product?.distributor_id);

      if (!isOwner) return null;

      return (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdjustStock(row.original)}
            className="flex items-center gap-1"
          >
            <Settings2 className="w-4 h-4" />
            Adjust
          </Button>
        </div>
      );
    },
  },
];
