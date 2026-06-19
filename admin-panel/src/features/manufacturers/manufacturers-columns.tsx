import { ColumnDef } from '@tanstack/react-table';
import { ManufacturerDto } from '@/types/api/manufacturer.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ManufacturerStatusBadge } from './components/ManufacturerStatusBadge';

interface ManufacturersColumnsProps {
  onViewDetails: (manufacturer: ManufacturerDto) => void;
  pendingManufacturerIds: Set<string>;
}

export const getManufacturersColumns = ({ onViewDetails, pendingManufacturerIds }: ManufacturersColumnsProps): ColumnDef<ManufacturerDto>[] => [
  {
    accessorKey: 'company_name',
    header: 'Company Name',
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.original.company_name}</div>
    ),
  },
  {
    accessorKey: 'contact_person',
    header: 'Contact Person',
    cell: ({ row }) => (
      <div className="text-slate-600">{row.original.contact_person || '-'}</div>
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
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isPending = pendingManufacturerIds.has(row.original.id);
      return <ManufacturerStatusBadge isPending={isPending} isActive={row.original.is_active} />;
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
          onClick={() => onViewDetails(row.original)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    ),
  },
];
