import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ShopStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'VERIFIED' | string;

interface ShopStatusBadgeProps {
  status: ShopStatus;
  className?: string;
}

export function ShopStatusBadge({ status, className }: ShopStatusBadgeProps) {
  const normalizedStatus = (status || '').toUpperCase();

  switch (normalizedStatus) {
    case 'APPROVED':
    case 'VERIFIED':
      return (
        <Badge variant="default" className={cn('bg-green-600 hover:bg-green-700', className)}>
          {normalizedStatus}
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="destructive" className={className}>
          {normalizedStatus}
        </Badge>
      );
    case 'PENDING':
    default:
      return (
        <Badge variant="outline" className={cn('text-yellow-600 border-yellow-600 bg-yellow-50', className)}>
          {normalizedStatus || 'PENDING'}
        </Badge>
      );
  }
}
