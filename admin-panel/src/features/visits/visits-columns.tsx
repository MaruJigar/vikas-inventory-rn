import { ColumnDef } from '@tanstack/react-table';
import { VisitDto } from '@/types/api/visit.types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search } from 'lucide-react';
import Link from 'next/link';

export const visitsColumns: ColumnDef<VisitDto>[] = [
  {
    accessorKey: 'shop.name',
    header: 'Shop Name',
    cell: ({ row }) => {
      const shop = row.original.shop;
      return <div className="font-medium">{shop?.name || 'Unknown'}</div>;
    },
  },
  {
    accessorKey: 'salesman.full_name',
    header: 'Salesman',
    cell: ({ row }) => {
      const salesman = row.original.salesman;
      return <div>{salesman?.full_name || 'Unknown'}</div>;
    },
  },
  {
    accessorKey: 'started_at',
    header: 'Started At',
    cell: ({ row }) => {
      return <div>{formatDate(row.original.started_at)}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
      if (status === 'ACTIVE' || status === 'ONGOING') variant = 'default';
      else if (status === 'CLOSED') variant = 'secondary';
      else variant = 'outline';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'location',
    header: 'Start Location',
    cell: ({ row }) => {
      const coords = row.original.start_location?.coordinates;
      if (!coords || coords.length !== 2) return <span className="text-slate-400">N/A</span>;
      
      const [lng, lat] = coords;
      const gmapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      
      return (
        <a 
          href={gmapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
        >
          <MapPin className="h-4 w-4 mr-1" />
          View Map
        </a>
      );
    },
  },
  {
    id: 'order_status',
    header: 'Ended With Order',
    cell: ({ row }) => {
      const { orders, no_order_reason, status } = row.original;
      
      if (status === 'ACTIVE' || status === 'ONGOING') {
        return <span className="text-slate-400">-</span>;
      }

      if (orders && orders.length > 0) {
        const orderNum = orders[0].order_number;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-emerald-600 font-medium">Yes</span>
            <Link 
              href={`/orders?search=${orderNum}`} 
              className="text-xs inline-flex items-center text-blue-600 hover:underline"
            >
              <Search className="h-3 w-3 mr-1" />
              {orderNum}
            </Link>
          </div>
        );
      }

      return (
        <div className="flex flex-col gap-1">
          <span className="text-red-600 font-medium">No</span>
          {no_order_reason && (
            <span className="text-xs text-slate-500 max-w-[150px] truncate" title={no_order_reason}>
              {no_order_reason}
            </span>
          )}
        </div>
      );
    },
  }
];
