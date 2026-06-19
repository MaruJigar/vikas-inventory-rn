import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { salesmenKeys } from '@/lib/query-keys/salesmen';
import { ReviewApprovalDto } from '@/types/api/approval.types';

export function useReviewApprovalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewApprovalDto }) =>
      approvalService.reviewRequest(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalsKeys.all });
      queryClient.invalidateQueries({ queryKey: salesmenKeys.all });
    },
  });
}
