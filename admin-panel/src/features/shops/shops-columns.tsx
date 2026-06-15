import { ColumnDef } from '@tanstack/react-table';
import { ShopDto } from '@/types/api/shop.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ShopStatusBadge } from './components/shop-status-badge';
import Image from 'next/image';

interface ShopsColumnsProps {
  onViewDetails: (shop: ShopDto) => void;
}

export const getShopsColumns = ({ onViewDetails }: ShopsColumnsProps): ColumnDef<ShopDto>[] => [
  {
    accessorKey: 'verification_photo_url',
    header: 'Image',
    cell: ({ row }) => {
      const url = row.original.verification_photo_url;
      if (!url) return <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">N/A</div>;
      
      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border">
          <Image
            src={process.env.NEXT_PUBLIC_API_URL + url}
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
    header: 'Shop Name',
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'owner_name',
    header: 'Owner Name',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.owner_name || '-'}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Mobile',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.phone}</div>
    ),
  },
  {
    accessorKey: 'distributor_id',
    header: 'Distributor',
    cell: ({ row }) => (
      <div className="text-slate-600 text-sm truncate max-w-[120px]" title={row.original.distributor_id}>
        {row.original.distributor_id || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'created_by_salesman_id',
    header: 'Salesman',
    cell: ({ row }) => (
      <div className="text-slate-600 text-sm truncate max-w-[120px]" title={row.original.created_by_salesman_id}>
        {row.original.created_by_salesman_id || '-'}
      </div>
    ),
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const { address, city, state } = row.original;
      const fullAddress = [address, city, state].filter(Boolean).join(', ');
      return (
        <div className="text-slate-600 truncate max-w-[200px]" title={fullAddress}>
          {fullAddress || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'verification_status',
    header: 'Status',
    cell: ({ row }) => <ShopStatusBadge status={row.original.verification_status} />,
  },
  {
    accessorKey: 'created_at',
    header: 'Created Date',
    cell: ({ row }) => (
      <div className="text-slate-600 whitespace-nowrap">
        {formatDate(row.original.created_at)}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(row.original)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    ),
  },
];
