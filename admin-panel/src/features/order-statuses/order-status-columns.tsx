import { ColumnDef } from '@tanstack/react-table';
import { OrderStatusDto } from '@/types/api/order-status.types';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Edit, Eye, ListOrdered, Power } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderStatusColumnsProps {
  onViewDetails: (status: OrderStatusDto) => void;
  onEdit: (status: OrderStatusDto) => void;
  onToggleActive: (status: OrderStatusDto) => void;
  canManage?: boolean;
}

export const getOrderStatusColumns = ({
  onViewDetails,
  onEdit,
  onToggleActive,
  canManage = true,
}: OrderStatusColumnsProps): ColumnDef<OrderStatusDto>[] => [
  {
    accessorKey: 'sequence',
    header: 'Sequence',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono font-medium">
        #{row.original.sequence}
      </Badge>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Status Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
          <ListOrdered className="h-4 w-4" />
        </div>
        <span className="font-semibold text-slate-900">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'isactive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isactive;
      return isActive ? (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-slate-600 font-medium">
          Inactive
        </Badge>
      );
    },
  },
  {
    accessorKey: 'can_cancel_order',
    header: 'Can Cancel',
    cell: ({ row }) => {
      return row.original.can_cancel_order ? (
        <Badge variant="outline" className="text-sky-700 border-sky-300 bg-sky-50 font-normal">
          Yes
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No</span>
      );
    },
  },
  {
    id: 'special_type',
    header: 'Special Type',
    cell: ({ row }) => {
      if (row.original.is_cancel_status) {
        return (
          <Badge variant="destructive" className="font-normal">
            Cancellation
          </Badge>
        );
      }
      if (row.original.is_dispatch_status) {
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-normal">
            Dispatch
          </Badge>
        );
      }
      return <span className="text-muted-foreground text-sm">—</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created Date',
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 whitespace-nowrap">
        {formatDate(row.getValue('created_at'))}
      </span>
    ),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated Date',
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 whitespace-nowrap">
        {formatDate(row.getValue('updated_at'))}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onViewDetails(row.original)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {canManage && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onToggleActive(row.original)}
                      className="cursor-pointer"
                    >
                      <Power className="mr-2 h-4 w-4 text-slate-500" />
                      {row.original.isactive ? 'Mark as Inactive' : 'Mark as Active'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
