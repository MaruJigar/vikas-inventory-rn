import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SalesmanStatusBadgeProps {
  status?: string;
}

export function SalesmanStatusBadge({ status }: SalesmanStatusBadgeProps) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;

  switch (status) {
    case 'APPROVED':
      return (
        <Badge
          variant="outline"
          className={cn(
            'bg-green-50 text-green-700 border-green-200',
            'hover:bg-green-50 hover:text-green-700'
          )}
        >
          Approved
        </Badge>
      );
    case 'PENDING_APPROVAL':
      return (
        <Badge
          variant="outline"
          className={cn(
            'bg-yellow-50 text-yellow-700 border-yellow-200',
            'hover:bg-yellow-50 hover:text-yellow-700'
          )}
        >
          Pending
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge
          variant="outline"
          className={cn(
            'bg-red-50 text-red-700 border-red-200',
            'hover:bg-red-50 hover:text-red-700'
          )}
        >
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
  }
}
