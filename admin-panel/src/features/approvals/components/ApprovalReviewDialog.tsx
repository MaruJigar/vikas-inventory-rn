import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reviewApprovalSchema, ReviewApprovalFormData } from '../schema';
import { useReviewApprovalMutation } from '@/hooks/approvals/useReviewApprovalMutation';

interface ApprovalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalId: string | null;
}

export function ApprovalReviewDialog({
  open,
  onOpenChange,
  approvalId,
}: ApprovalReviewDialogProps) {
  const reviewMutation = useReviewApprovalMutation();
  const form = useForm<ReviewApprovalFormData>({
    resolver: zodResolver(reviewApprovalSchema),
    defaultValues: {
      status: 'APPROVED',
      rejection_reason: '',
    },
  });

  const statusValue = form.watch('status');

  const onSubmit = (data: ReviewApprovalFormData) => {
    if (!approvalId) return;
    reviewMutation.mutate(
      { id: approvalId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  const handleApprove = () => {
    form.setValue('status', 'APPROVED');
    form.clearErrors();
  };

  const handleReject = () => {
    form.setValue('status', 'REJECTED');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) form.reset();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Request</DialogTitle>
          <DialogDescription>
            Approve or reject this request. If rejecting, a reason is required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={statusValue === 'APPROVED' ? 'default' : 'outline'}
              onClick={handleApprove}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              type="button"
              variant={statusValue === 'REJECTED' ? 'destructive' : 'outline'}
              onClick={handleReject}
              className="flex-1"
            >
              Reject
            </Button>
          </div>

          {statusValue === 'REJECTED' && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                className="resize-none"
                {...form.register('rejection_reason')}
              />
              {form.formState.errors.rejection_reason && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.rejection_reason.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
