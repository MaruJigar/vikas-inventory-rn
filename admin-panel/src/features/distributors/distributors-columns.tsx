import { ColumnDef } from '@tanstack/react-table';
import { DistributorDto } from '@/types/api/distributor.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { DistributorStatusBadge } from './components/DistributorStatusBadge';

interface DistributorsColumnsProps {
  onViewDetails: (distributor: DistributorDto) => void;
  onEdit: (distributor: DistributorDto) => void;
  onDelete: (distributor: DistributorDto) => void;
}

export const getDistributorsColumns = ({ onViewDetails, onEdit, onDelete }: DistributorsColumnsProps): ColumnDef<DistributorDto>[] => [
  {
    accessorKey: 'business_name',
    header: 'Business Name',
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.business_name}</div>
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
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.city || '-'}</div>
    ),
  },
  {
    accessorKey: 'state',
    header: 'State',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.state || '-'}</div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return <DistributorStatusBadge isActive={row.original.is_active} />;
    },
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
      <div className="flex justify-end gap-2">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    ),
  },
];
