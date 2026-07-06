import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalDto } from "@/types/api/approval.types";
import { Skeleton } from "@/components/ui/skeleton";

interface ApprovalsTableProps {
  approvals: ApprovalDto[];
  isLoading: boolean;
  onRowClick: (approval: ApprovalDto) => void;
}

export function ApprovalsTable({ approvals, isLoading, onRowClick }: ApprovalsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-gray-500">
        No approvals found matching your criteria.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map((approval) => (
            <TableRow 
              key={approval.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(approval)}
            >
              <TableCell className="font-medium">{approval.id.substring(0, 8)}...</TableCell>
              <TableCell>{approval.request_type}</TableCell>
              <TableCell>{approval.requester_user_id || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(approval.status)} variant="outline">
                  {approval.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(approval.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRowClick(approval); }}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
