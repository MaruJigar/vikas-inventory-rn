import { Badge } from '@/components/ui/badge';
import { ApprovalStatus } from '@/types/approval.types';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  switch (status) {
    case 'APPROVED':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100/80">Approved</Badge>;
    case 'PENDING_APPROVAL':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80">Pending</Badge>;
    case 'REJECTED':
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100/80">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
