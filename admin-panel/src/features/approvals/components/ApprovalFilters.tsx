import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApprovalFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function ApprovalFilters({ status, onStatusChange }: ApprovalFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-64">
        <Select
          value={status}
          onValueChange={(val) => val && onStatusChange(val === 'ALL' ? '' : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="ALL">All Statuses</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
