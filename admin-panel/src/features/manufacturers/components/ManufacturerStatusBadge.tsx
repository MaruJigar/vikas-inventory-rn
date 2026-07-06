import { Badge } from '@/components/ui/badge';

interface ManufacturerStatusBadgeProps {
  isActive: boolean;
}

export function ManufacturerStatusBadge({ isActive }: ManufacturerStatusBadgeProps) {
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
