import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalDto } from "@/types/api/approval.types";
import { useReviewApprovalMutation } from "@/hooks/useReviewApprovalMutation";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface ApprovalReviewDialogProps {
  approval: ApprovalDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApprovalReviewDialog({ approval, open, onOpenChange }: ApprovalReviewDialogProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const reviewMutation = useReviewApprovalMutation();
  const userRole = useAuthStore(state => state.user?.role);

  if (!approval) return null;

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (status === 'REJECTED' && !rejectReason) return;
    
    reviewMutation.mutate(
      { id: approval.id, dto: { status, rejection_reason: status === 'REJECTED' ? rejectReason : undefined } },
      {
        onSuccess: () => {
          setRejectReason("");
          setIsRejecting(false);
          onOpenChange(false);
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'REJECTED': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    }
  };

  // Distributor Admins can't review unless specified (assuming backend allows, but requirement says "Otherwise hide review actions" if read-only)
  const canReview = userRole === 'SUPER_ADMIN' || userRole === 'MANUFACTURER_ADMIN';

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setIsRejecting(false);
        setRejectReason("");
      }
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approval Request Details</DialogTitle>
          <DialogDescription>
            Review the details of this request before taking action.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="font-medium text-sm text-gray-500">Request ID</div>
            <div className="col-span-2 text-sm">{approval.id}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="font-medium text-sm text-gray-500">Type</div>
            <div className="col-span-2 text-sm">{approval.request_type}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="font-medium text-sm text-gray-500">Requester</div>
            <div className="col-span-2 text-sm">{approval.requester_user_id || 'Unknown'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="font-medium text-sm text-gray-500">Date</div>
            <div className="col-span-2 text-sm">{new Date(approval.created_at).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium text-sm text-gray-500">Status</div>
            <div className="col-span-2">
              <Badge className={getStatusColor(approval.status)} variant="outline">
                {approval.status}
              </Badge>
            </div>
          </div>

          {isRejecting && (
            <div className="mt-4 space-y-2">
              <div className="font-medium text-sm">Rejection Reason</div>
              <Textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full"
              />
            </div>
          )}
        </div>

        {approval.status === 'PENDING_APPROVAL' && canReview && (
          <DialogFooter className="flex space-x-2 justify-end">
            {!isRejecting ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                <Button onClick={() => handleReview('APPROVED')} disabled={reviewMutation.isPending}>
                  {reviewMutation.isPending ? 'Processing...' : 'Approve'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsRejecting(false)}>Back</Button>
                <Button variant="destructive" onClick={() => handleReview('REJECTED')} disabled={!rejectReason || reviewMutation.isPending}>
                  {reviewMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
