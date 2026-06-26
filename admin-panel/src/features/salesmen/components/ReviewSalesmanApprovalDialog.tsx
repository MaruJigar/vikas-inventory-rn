'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useReviewApprovalMutation } from '@/hooks/approvals/useReviewApprovalMutation';
import { usePendingApprovalsQuery } from '@/hooks/approvals/usePendingApprovalsQuery';
import { SalesmanDto } from '@/types/api/salesman.types';

const rejectionSchema = z.object({
  reason: z.string().min(5, 'Rejection reason must be at least 5 characters long.'),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

interface ReviewSalesmanApprovalDialogProps {
  salesman: SalesmanDto | null;
  action: 'APPROVE' | 'REJECT' | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewSalesmanApprovalDialog({
  salesman,
  action,
  isOpen,
  onClose,
}: ReviewSalesmanApprovalDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { data: pendingResponse, isLoading: isLoadingApprovals } = usePendingApprovalsQuery();
  const reviewMutation = useReviewApprovalMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: '' },
  });

  const isRejecting = action === 'REJECT';

  // Find the approval request corresponding to this salesman
  const approvalRequest = pendingResponse?.data?.find(
    (req: unknown) => {
      const r = req as { salesman_id: string; status: string };
      return r.salesman_id === salesman?.id && r.status === 'PENDING_APPROVAL';
    }
  );

  const onSubmit = async (data?: RejectionFormValues) => {
    if (!salesman || !action) return;

    if (!approvalRequest) {
      setErrorMsg('Could not find the pending approval request for this salesman. It may have already been processed.');
      return;
    }

    setErrorMsg(null);

    try {
      await reviewMutation.mutateAsync({
        id: approvalRequest.id,
        data: {
          status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          rejection_reason: action === 'REJECT' ? data?.reason : undefined,
        },
      });
      
      reset();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr?.response?.data?.message || (err as Error).message || 'Review failed');
    }
  };

  const handleClose = () => {
    reset();
    setErrorMsg(null);
    onClose();
  };

  if (!salesman || !action) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isRejecting ? 'Reject Salesman' : 'Approve Salesman'}
          </DialogTitle>
          <DialogDescription>
            {isRejecting 
              ? `Are you sure you want to reject the registration of ${salesman.full_name}?`
              : `Are you sure you want to approve the registration of ${salesman.full_name}? They will be granted access immediately.`}
          </DialogDescription>
        </DialogHeader>

        {isLoadingApprovals && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Verifying request...
          </div>
        )}

        {!isLoadingApprovals && !approvalRequest && (
          <div className="py-4 text-center text-sm text-destructive">
            Warning: The pending approval request for this salesman could not be found. It may have already been reviewed.
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-2">
            {errorMsg}
          </div>
        )}

        {isRejecting && approvalRequest && (
          <form id="reject-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea 
                id="reason" 
                placeholder="Please provide a reason for rejection..."
                className="min-h-[100px]"
                {...register('reason')} 
              />
              {errors.reason && <p className="text-destructive text-xs">{errors.reason.message}</p>}
            </div>
          </form>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          
          {approvalRequest && (
            isRejecting ? (
              <Button 
                type="submit" 
                form="reject-form" 
                variant="destructive" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rejecting...' : 'Reject Salesman'}
              </Button>
            ) : (
              <Button 
                onClick={() => onSubmit()} 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Approving...' : 'Approve Salesman'}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
