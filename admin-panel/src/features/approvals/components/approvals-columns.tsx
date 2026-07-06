import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ApprovalRequestDto } from '@/types/approval.types';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface GetColumnsProps {
  onReview: (id: string) => void;
}

export const getApprovalColumns = ({
  onReview,
}: GetColumnsProps): ColumnDef<ApprovalRequestDto>[] => [
  {
    accessorKey: 'request_type',
    header: 'Type',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue<string>('request_type').replace(/_/g, ' ')}
      </span>
    ),
  },
  {
    accessorKey: 'requester_name',
    header: 'Requester',
    cell: ({ row }) => row.original.requester_name || '-',
  },
  {
    accessorKey: 'salesman_name',
    header: 'Salesman',
    cell: ({ row }) => row.original.salesman_name || '-',
  },
  {
    accessorKey: 'distributor_name',
    header: 'Distributor',
    cell: ({ row }) => row.original.distributor_name || '-',
  },
  {
    accessorKey: 'manufacturer_name',
    header: 'Manufacturer',
    cell: ({ row }) => row.original.manufacturer_name || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ApprovalStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'submitted_at',
    header: 'Submitted',
    cell: ({ row }) => {
      const dateStr = row.getValue<string>('submitted_at');
      return dateStr ? format(new Date(dateStr), 'PPp') : '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const approval = row.original;
      const isPending = approval.status === 'PENDING_APPROVAL';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-slate-100 flex items-center justify-center rounded-md">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isPending && (
              <DropdownMenuItem onClick={() => onReview(approval.id)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Review Request
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
