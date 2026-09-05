import { useQuery } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';

export function usePendingApprovalsQuery() {
  return useQuery({
    queryKey: approvalsKeys.list({ status: 'PENDING_APPROVAL' }),
    // Use the max allowed limit to fetch as many as possible to find the matching approval request client-side
    queryFn: () => approvalService.getApprovals({ limit: 100, status: 'PENDING_APPROVAL' }),
  });
}
