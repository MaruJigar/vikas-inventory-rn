import { useQuery } from '@tanstack/react-query';
import { approvalService } from '@/services/approval.service';
import { approvalKeys } from './query-keys';
import { QueryParams } from '@/types/api/common.types';

export const useApprovalsQuery = (params: QueryParams & { status?: string }) => {
  return useQuery({
    queryKey: approvalKeys.list(params),
    queryFn: () => approvalService.getApprovals(params),
    placeholderData: (previousData) => previousData,
  });
};
