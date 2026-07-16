import { ColumnDef } from '@tanstack/react-table';
import { OrderDto } from '@/types/api/order.types';
import { formatDate } from '@/lib/utils';
import { Eye, MoreHorizontal, Edit, XCircle, ArrowRightLeft, History, ClipboardList } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatusBadge } from './components/order-status-badge';
import { UserRole } from '@/store/useAuthStore';

interface OrdersColumnsProps {
  userRole: UserRole | undefined;
  onViewDetails: (order: OrderDto) => void;
  onEdit: (order: OrderDto) => void;
  onCancel: (order: OrderDto) => void;
  onUpdateStatus: (order: OrderDto) => void;
  onViewHistory: (order: OrderDto) => void;
  onViewFulfillmentLogs: (order: OrderDto) => void;
}

export const getOrdersColumns = ({ 
  userRole,
  onViewDetails,
  onEdit,
  onCancel,
  onUpdateStatus,
  onViewHistory,
  onViewFulfillmentLogs
}: OrdersColumnsProps): ColumnDef<OrderDto>[] => [
  {
    accessorKey: 'order_number',
    header: 'Order Number',
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.id ? row.original.order_number ?? row.original.id.substring(0,8).toUpperCase() : 'N/A'}</div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const isPO = row.original.salesman_id === null;
      return (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${isPO ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {isPO ? 'Purchase Order' : 'Salesman Order'}
        </span>
      );
    },
  },
  {
    accessorKey: 'shop',
    header: 'Shop',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.shop?.name || 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'salesman',
    header: 'Salesman',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.salesman?.full_name || 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'distributor',
    header: 'Distributor',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.distributor?.business_name || 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const statusStr = typeof row.original.status === 'object' ? (row.original.status as any)?.name : row.original.status;
      return <OrderStatusBadge status={statusStr} />;
    },
  },
  {
    accessorKey: 'final_order_amount',
    header: 'Final Amount',
    cell: ({ row }) => {
      const amount = Number(row.original.final_order_amount) || 0;
      return <div className="text-slate-600 font-medium">₹{amount.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'total_quantity',
    header: 'Quantity',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.total_quantity || 0}</div>
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
    cell: ({ row }) => {
      const statusStr = typeof row.original.status === 'object' ? (row.original.status as any)?.name : row.original.status;
      const showEdit = (() => {
        if (userRole === 'SALESMAN') {
          return !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(statusStr);
        }
        if (userRole === 'DISTRIBUTOR_ADMIN' || userRole === 'MANUFACTURER_ADMIN') {
          return statusStr === 'DRAFT';
        }
        return false;
      })();
      const showCancel = (() => {
        if (statusStr === 'CANCELLED') return false;
        if (userRole === 'SALESMAN') {
          return !['SHIPPED', 'DELIVERED'].includes(statusStr);
        }
        if (userRole === 'DISTRIBUTOR_ADMIN' || userRole === 'SUPER_ADMIN') {
          return true;
        }
        return false;
      })();
      const showUpdateStatus = ['SUPER_ADMIN', 'DISTRIBUTOR_ADMIN', 'MANUFACTURER_ADMIN'].includes(userRole || '') && 
                               !['DELIVERED', 'CANCELLED'].includes(statusStr);

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onViewHistory(row.original)}>
                <History className="mr-2 h-4 w-4" />
                View History
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onViewFulfillmentLogs(row.original)}>
                <ClipboardList className="mr-2 h-4 w-4" />
                View Fulfillment Logs
              </DropdownMenuItem>
              
              {showEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </DropdownMenuItem>
              )}
              
              {showUpdateStatus && (
                <DropdownMenuItem onClick={() => onUpdateStatus(row.original)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
              )}

              {showCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onCancel(row.original)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
