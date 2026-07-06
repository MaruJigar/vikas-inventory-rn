import { ColumnDef } from '@tanstack/react-table';
import { BackorderDto } from '@/types/api/order.types';
import { formatDate } from '@/lib/utils';
import { Eye, MoreHorizontal, ArrowRightLeft } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/store/useAuthStore';

interface BackordersColumnsProps {
  userRole: UserRole | undefined;
  onViewDetails: (backorder: BackorderDto) => void;
  onResolve: (backorder: BackorderDto) => void;
}

export const getBackordersColumns = ({ 
  userRole,
  onViewDetails,
  onResolve
}: BackordersColumnsProps): ColumnDef<BackorderDto>[] => [
  {
    accessorKey: 'product',
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-900">{row.original.product?.name || 'N/A'}</div>
        <div className="text-xs text-slate-500">SKU: {row.original.product?.sku || 'N/A'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'quantities',
    header: 'Allocation',
    cell: ({ row }) => {
      const remaining = Number(row.original.quantity) - Number(row.original.resolved_quantity);
      return (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between w-24">
            <span className="text-slate-500">Req:</span>
            <span className="font-medium">{row.original.quantity}</span>
          </div>
          <div className="flex justify-between w-24">
            <span className="text-slate-500">Alloc:</span>
            <span className="font-medium text-blue-600">{row.original.resolved_quantity}</span>
          </div>
          <div className="flex justify-between w-24 border-t pt-1">
            <span className="text-slate-500">Rem:</span>
            <span className="font-semibold text-slate-900">{remaining}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'context',
    header: 'Context',
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium text-slate-900">{row.original.distributor?.business_name || 'N/A'}</div>
        <div className="text-slate-500 text-xs mt-0.5">SM: {row.original.order?.salesman?.full_name || 'N/A'}</div>
        <div className="text-slate-500 text-xs mt-0.5">Ord: {row.original.order?.order_number || 'N/A'}</div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let colorClass = 'bg-slate-100 text-slate-800';
      
      if (status === 'RESOLVED') colorClass = 'bg-green-100 text-green-800 border-green-200';
      if (status === 'PARTIALLY_ALLOCATED') colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
      if (status === 'OPEN') colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      if (status === 'CANCELLED') colorClass = 'bg-red-100 text-red-800 border-red-200';

      return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created Date',
    cell: ({ row }) => (
      <div className="text-sm text-slate-600">
        {formatDate(row.original.created_at)}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const showResolve = ['SUPER_ADMIN', 'DISTRIBUTOR_ADMIN'].includes(userRole || '') && 
                          !['RESOLVED', 'CANCELLED'].includes(row.original.status);

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-slate-100 h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {showResolve && (
                <DropdownMenuItem onClick={() => onResolve(row.original)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Resolve Allocation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
