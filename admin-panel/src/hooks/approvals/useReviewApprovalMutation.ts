import { handleSuccessToast, handleUnexpectedToast } from '@/lib/utils/toast-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalKeys } from './query-keys';
import { ReviewApprovalDto } from '@/types/approval.types';
import toast from 'react-hot-toast';

export const useReviewApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewApprovalDto }) =>
      approvalService.reviewApproval(id, data),
    onSuccess: (data) => {
      handleSuccessToast('Review Approval successful');
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      toast.success(data.message || 'Request reviewed successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const message = err.response?.data?.message || 'Failed to review request';
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
};
