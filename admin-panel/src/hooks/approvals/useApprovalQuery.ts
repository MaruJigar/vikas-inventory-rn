import { useQuery } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';

export const useApprovalQuery = (id: string | null) => {
  return useQuery({
    queryKey: approvalsKeys.detail(id as string),
    queryFn: () => approvalService.getApproval(id as string),
    enabled: !!id,
  });
};
