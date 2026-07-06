import { ColumnDef } from '@tanstack/react-table';
import { ShopDto } from '@/types/api/shop.types';
import { formatDate } from '@/lib/utils';

import { Eye, MoreHorizontal, Edit, Image as ImageIcon, Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShopStatusBadge } from './components/shop-status-badge';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image';

interface ShopsColumnsProps {
  onViewDetails: (shop: ShopDto) => void;
  onEdit: (shop: ShopDto) => void;
  onUploadImage: (shop: ShopDto) => void;
  onDelete: (shop: ShopDto) => void;
}

export const getShopsColumns = ({ 
  onViewDetails,
  onEdit,
  onUploadImage,
  onDelete
}: ShopsColumnsProps): ColumnDef<ShopDto>[] => [
  {
    accessorKey: 'verification_photo_url',
    header: 'Image',
    cell: ({ row }) => {
      const url = row.original.verification_photo_url;
      if (!url) return <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-400">N/A</div>;
      
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
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => {
      const city = row.original.city;
      const cityName = city && typeof city === 'object' ? (city as any).name : city;
      return <div className="text-slate-600">{cityName || '-'}</div>;
    },
  },
  {
    accessorKey: 'state',
    header: 'State',
    cell: ({ row }) => {
      const state = row.original.state;
      const stateName = state && typeof state === 'object' ? (state as any).name : state;
      return <div className="text-slate-600">{stateName || '-'}</div>;
    },
  },
  {
    accessorKey: 'verification_status',
    header: 'Status',
    cell: ({ row }) => <ShopStatusBadge status={row.original.verification_status} />,
  },
  {
    accessorKey: 'is_active',
    header: 'Active',
    cell: ({ row }) => (
      <div className="text-slate-600">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
          {row.original.is_active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
    ),
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
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Shop
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUploadImage(row.original)}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Image
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Shop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
