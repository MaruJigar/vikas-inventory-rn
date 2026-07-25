import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { approvalsApi } from '@/features/approvals/api';
import type {
  ApprovalStatus,
  ReviewApprovalPayload,
} from '@/features/approvals/types';

const PAGE_SIZE = 20;

export const approvalKeys = {
  all: ['approvals'] as const,
  list: (status: ApprovalStatus) => ['approvals', 'list', status] as const,
  detail: (id: string) => ['approvals', 'detail', id] as const,
};

/** Pending approval requests for the current reviewer. The backend defaults to
 * PENDING_APPROVAL but accepts APPROVED/REJECTED to browse history. */
export function useApprovals(status: ApprovalStatus) {
  return useInfiniteQuery({
    queryKey: approvalKeys.list(status),
    queryFn: ({ pageParam }) =>
      approvalsApi.list({ page: pageParam, limit: PAGE_SIZE, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
}

export function useApproval(id: string) {
  return useQuery({
    queryKey: approvalKeys.detail(id),
    queryFn: () => approvalsApi.getById(id),
  });
}

/** Approve or reject a request. Side effects server-side (shop verified /
 * salesman activated), so invalidate approvals + shops + salesmen + dashboard. */
export function useReviewApproval(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewApprovalPayload) =>
      approvalsApi.review(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: approvalKeys.all });
      void qc.invalidateQueries({ queryKey: ['shops'] });
      void qc.invalidateQueries({ queryKey: ['salesmen'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
