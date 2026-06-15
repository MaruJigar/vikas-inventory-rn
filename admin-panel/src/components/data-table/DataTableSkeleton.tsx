import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
}

export function DataTableSkeleton({ columns, rows = 10 }: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
