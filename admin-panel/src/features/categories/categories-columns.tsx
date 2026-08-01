import { ColumnDef } from '@tanstack/react-table';
import { CategoryDto } from '@/types/api/product.types';
import { QueryParams } from '@/types/api/common.types';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
  queryState: QueryParams;
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const renderSortHeader = (title: string, columnKey: string, queryState: QueryParams, setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void) => {
  const isSorted = queryState.sortBy === columnKey;
  const isAsc = isSorted && queryState.sortOrder?.toLowerCase() === 'asc';
  
  return (
    <Button
      variant="ghost"
      onClick={() => setSort(columnKey, isAsc ? 'desc' : 'asc')}
      className="-ml-4 h-8 data-[state=open]:bg-accent"
    >
      <span>{title}</span>
      {isSorted ? (
        isAsc ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

export const getCategoryColumns = ({
  onEdit,
  onDelete,
  canManage,
  queryState,
  setSort,
}: CategoryColumnsProps): ColumnDef<CategoryDto>[] => [
  {
    accessorKey: 'name',
    header: () => renderSortHeader('Name', 'name', queryState, setSort),
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
    accessorKey: 'created_at',
    header: () => renderSortHeader('Created Date', 'created_at', queryState, setSort),
    cell: ({ row }) => formatDate(row.getValue('created_at')),
  },
  {
    accessorKey: 'updated_at',
    header: () => renderSortHeader('Updated Date', 'updated_at', queryState, setSort),
    cell: ({ row }) => formatDate(row.getValue('updated_at')),
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
