import { ColumnDef } from '@tanstack/react-table';
import { ManufacturerDto } from '@/types/api/manufacturer.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { ManufacturerStatusBadge } from './components/ManufacturerStatusBadge';

interface ManufacturersColumnsProps {
  onViewDetails: (manufacturer: ManufacturerDto) => void;
  onEdit: (manufacturer: ManufacturerDto) => void;
  onDelete: (manufacturer: ManufacturerDto) => void;
}

export const getManufacturersColumns = ({ onViewDetails, onEdit, onDelete }: ManufacturersColumnsProps): ColumnDef<ManufacturerDto>[] => [
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
      return <ManufacturerStatusBadge isActive={row.original.is_active} />;
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
