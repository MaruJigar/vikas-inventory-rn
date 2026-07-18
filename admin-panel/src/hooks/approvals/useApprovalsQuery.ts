import { useQuery } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalsKeys } from '@/lib/query-keys/approvals';
import { QueryParams } from '@/types/api/common.types';

export const useApprovalsQuery = (params: QueryParams & { status?: string }) => {
  return useQuery({
    queryKey: approvalsKeys.list(params),
    queryFn: () => approvalService.getApprovals(params),
    placeholderData: (previousData) => previousData,
  });
};
