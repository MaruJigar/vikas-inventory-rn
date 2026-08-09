import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Circle, CheckCircle2, XCircle, CalendarX2, Palmtree } from 'lucide-react';

export type AttendanceStatus = 'ACTIVE' | 'COMPLETED' | 'ABSENT' | 'PRESENT' | 'NON_WORKING_DAY' | 'HOLIDAY';

export function AttendanceStatusBadge({ status, className }: { status: AttendanceStatus | string | null; className?: string }) {
  if (!status) return null;

  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="outline" className={cn("border-blue-500 text-blue-700 bg-blue-50 gap-1", className)}>
          <Circle className="w-3 h-3 fill-blue-500 text-blue-500" /> ACTIVE
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className={cn("border-green-500 text-green-700 bg-green-50 gap-1", className)}>
          <CheckCircle2 className="w-3 h-3" /> COMPLETED
        </Badge>
      );
    case 'ABSENT':
      return (
        <Badge variant="outline" className={cn("border-red-500 text-red-700 bg-red-50 gap-1", className)}>
          <XCircle className="w-3 h-3" /> ABSENT
        </Badge>
      );
    case 'PRESENT':
      return (
        <Badge variant="outline" className={cn("border-green-500 text-green-700 bg-green-50 gap-1", className)}>
          <CheckCircle2 className="w-3 h-3" /> PRESENT
        </Badge>
      );
    case 'NON_WORKING_DAY':
      return (
        <Badge variant="outline" className={cn("border-slate-300 text-slate-600 bg-slate-50 gap-1", className)}>
          <CalendarX2 className="w-3 h-3" /> NON-WORKING
        </Badge>
      );
    case 'HOLIDAY':
      return (
        <Badge variant="outline" className={cn("border-amber-500 text-amber-700 bg-amber-50 gap-1", className)}>
          <Palmtree className="w-3 h-3" /> HOLIDAY
        </Badge>
      );
    default:
      return <Badge variant="secondary" className={className}>{status}</Badge>;
  }
}
