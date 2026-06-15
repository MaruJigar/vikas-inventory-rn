import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PaginatedResponse } from '@/types/api/common.types';

interface DataTablePaginationProps {
  meta: PaginatedResponse<unknown>['meta'];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTablePagination({
  meta,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  const { page, limit, total, totalPages } = meta;
  
  // Safety checks in case totalPages is not returned from some backend endpoints yet
  const safeTotalPages = totalPages ?? Math.ceil(total / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < safeTotalPages;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{' '}
        {Math.min(page * limit, total)} of {total} entries.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page} of {safeTotalPages === 0 ? 1 : safeTotalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
