import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useApprovalQuery } from '@/hooks/approvals/useApprovalQuery';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviewApprovalMutation } from '@/hooks/approvals/useReviewApprovalMutation';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ApprovalDetailsDrawerProps {
  approvalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApprovalDetailsDrawer({ approvalId, isOpen, onClose }: ApprovalDetailsDrawerProps) {
  const { data: response, isLoading, isError, refetch } = useApprovalQuery(approvalId);
  const data = response;

  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const reviewMutation = useReviewApprovalMutation();
  const userRole = useAuthStore(state => state.user?.role);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    }
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!approvalId) return;
    if (status === 'REJECTED' && !rejectReason) return;
    
    reviewMutation.mutate(
      { id: approvalId, data: { status, rejection_reason: status === 'REJECTED' ? rejectReason : undefined } },
      {
        onSuccess: () => {
          setRejectReason("");
          setIsRejecting(false);
          refetch();
        }
      }
    );
  };

  return (
    <EntityFormDrawer 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setIsRejecting(false);
          setRejectReason("");
          onClose();
        }
      }}
      title="Approval Details"
      width="lg"
    >
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {isError && (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">
          Failed to load approval details. It might have been deleted or you do not have permission to view it.
        </div>
      )}

      {data && data.request && (
        <div className="space-y-6 pb-24">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Request Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-sm break-all">{data.request.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(data.request.status)} variant="outline">
                    {data.request.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Request Type</p>
                  <p className="text-sm font-medium">{data.request.request_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted At</p>
                  <p className="text-sm">{formatDate(data.request.created_at)}</p>
                </div>
                {data.requester && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Submitted By</p>
                    <p className="text-sm">{data.requester.full_name} ({data.requester.email || data.requester.phone})</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {data.entity && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Entity Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(data.entity).map(([key, value]) => {
                    if (key.includes('id') || key.includes('_at') || typeof value === 'object') return null;
                    return (
                      <div key={key}>
                        <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-sm">{String(value) || '-'}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {data.logs && data.logs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action_type}</Badge>
                        </TableCell>
                        <TableCell>{log.acted_by_user_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={log.metadata?.reason}>
                          {log.metadata?.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {data.request.status === 'PENDING_APPROVAL' && (userRole === 'SUPER_ADMIN' || userRole === 'MANUFACTURER_ADMIN' || userRole === 'DISTRIBUTOR_ADMIN') && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-end gap-3 z-10 shadow-lg" style={{ left: 'auto', width: '100%', maxWidth: '32rem' }}>
              {isRejecting ? (
                <div className="flex flex-col w-full gap-3">
                  <Textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason (Required)"
                    className="w-full"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => handleReview('REJECTED')} disabled={!rejectReason || reviewMutation.isPending}>
                      {reviewMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                  <Button onClick={() => handleReview('APPROVED')} disabled={reviewMutation.isPending}>
                    {reviewMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </EntityFormDrawer>
  );
}
