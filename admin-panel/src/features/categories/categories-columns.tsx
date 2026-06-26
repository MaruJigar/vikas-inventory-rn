import { ColumnDef } from '@tanstack/react-table';
import { CategoryDto } from '@/types/api/product.types';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CategoryRowData = CategoryDto & {
  parent?: { name: string };
};

interface CategoryColumnsProps {
  onEdit: (category: CategoryDto) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

export const getCategoryColumns = ({
  onEdit,
  onDelete,
  canManage,
}: CategoryColumnsProps): ColumnDef<CategoryDto>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    id: 'parent',
    header: 'Parent Category',
    cell: ({ row }) => {
      const data = row.original as CategoryRowData;
      return <span>{data.parent?.name || 'None'}</span>;
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.getValue('description') as string;
      return <span className="text-muted-foreground">{desc || '—'}</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created Date',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM dd, yyyy'),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      if (!canManage) return null;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
