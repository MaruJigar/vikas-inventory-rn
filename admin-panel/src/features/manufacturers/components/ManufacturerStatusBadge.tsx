import { Badge } from '@/components/ui/badge';

interface ManufacturerStatusBadgeProps {
  isPending: boolean;
  isActive: boolean;
}

export function ManufacturerStatusBadge({ isPending, isActive }: ManufacturerStatusBadgeProps) {
  if (isPending) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending Approval
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      Inactive
    </Badge>
  );
}
