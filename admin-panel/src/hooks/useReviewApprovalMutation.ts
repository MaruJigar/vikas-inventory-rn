import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { ReviewApprovalDto } from '@/types/api/approval.types';

export const useReviewApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewApprovalDto }) =>
      approvalService.reviewApproval(id, dto),
    onError: (error) => {
      handleUnexpectedToast(error);
    },
    onSuccess: () => {
      handleSuccessToast('Review Approval successful');
      queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
    },
  });
};
