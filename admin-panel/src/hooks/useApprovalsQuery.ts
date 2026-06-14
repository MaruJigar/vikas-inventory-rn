import { useQuery } from '@tanstack/react-query';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { approvalService } from '@/services/approval.service';

export const useApprovalsQuery = (filters: Record<string, unknown>) => {
  return useQuery({
    queryKey: approvalsKeys.list(filters),
    queryFn: () => approvalService.getPendingRequests(),
  });
};
