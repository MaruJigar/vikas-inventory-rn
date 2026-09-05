import { ColumnDef } from '@tanstack/react-table';
import { CategoryDto } from '@/types/api/product.types';
import { formatDate } from '@/lib/utils';
import { MoreHorizontal, Edit, Trash2, Eye, Layers } from 'lucide-react';
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

type CategoryRowData = CategoryDto & {
  parent?: { name: string };
};

interface CategoryColumnsProps {
  onViewDetails: (category: CategoryDto) => void;
  onEdit: (category: CategoryDto) => void;
  onDelete: (category: CategoryDto) => void;
  canManage?: boolean;
}

export const getCategoryColumns = ({
  onViewDetails,
  onEdit,
  onDelete,
  canManage = true,
}: CategoryColumnsProps): ColumnDef<CategoryDto>[] => [
  {
    accessorKey: 'name',
    header: 'Category Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
          <Layers className="h-4 w-4" />
        </div>
        <span className="font-medium text-slate-900">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: 'parent',
    header: 'Parent Category',
    cell: ({ row }) => {
      const data = row.original as CategoryRowData;
      return data.parent?.name ? (
        <Badge variant="secondary" className="font-normal">
          {data.parent.name}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">— None (Top Level) —</span>
      );
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
            <DropdownMenuContent align="end" className="w-44">
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
                      Edit Category
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => onDelete(row.original)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Category
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
