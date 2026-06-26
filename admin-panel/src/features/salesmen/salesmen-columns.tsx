import { ColumnDef } from '@tanstack/react-table';
import { SalesmanDto } from '@/types/api/salesman.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Eye, CheckCircle, XCircle } from 'lucide-react';
import { SalesmanStatusBadge } from './components/SalesmanStatusBadge';

type SalesmanRowData = SalesmanDto & {
  distributor?: { business_name: string };
};

interface SalesmenColumnsProps {
  onViewDetails: (salesman: SalesmanDto) => void;
  onEdit: (salesman: SalesmanDto) => void;
  onReview: (salesman: SalesmanDto, action: 'APPROVE' | 'REJECT') => void;
}

export const getSalesmenColumns = ({ onViewDetails, onEdit, onReview }: SalesmenColumnsProps): ColumnDef<SalesmanDto>[] => [
  {
    accessorKey: 'full_name',
    header: 'Full Name',
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.full_name}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.email || '-'}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.phone || '-'}</div>
    ),
  },
  {
    id: 'distributor',
    header: 'Distributor',
    cell: ({ row }) => {
      const data = row.original as SalesmanRowData;
      return (
        <div className="text-slate-600 text-sm truncate max-w-[120px]">
          {data.distributor?.business_name || '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'approval_status',
    header: 'Status',
    cell: ({ row }) => <SalesmanStatusBadge status={row.original.approval_status} />,
  },
  {
    accessorKey: 'is_active',
    header: 'Active Status',
    cell: ({ row }) => (
      <div className="text-slate-600">
        {row.original.is_active ? 'Active' : 'Inactive'}
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
    cell: ({ row }) => {
      const isPending = row.original.approval_status === 'PENDING_APPROVAL';
      
      return (
        <div className="flex justify-end gap-2">
          {isPending && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onReview(row.original, 'APPROVE')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onReview(row.original, 'REJECT')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(row.original)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
        </div>
      );
    },
  },
];
