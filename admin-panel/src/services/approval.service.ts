import { api as apiClient } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ApprovalRequestDto, ReviewApprovalDto } from '@/types/approval.types';

export const approvalService = {
  getApprovals: async (params?: QueryParams & { status?: string }): Promise<PaginatedResponse<ApprovalRequestDto>> => {
    const response = await apiClient.get<PaginatedResponse<ApprovalRequestDto>>('/approvals/pending', {
      params,
    });
    return response.data;
  },

  reviewApproval: async (id: string, data: ReviewApprovalDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/approvals/${id}/review`, data);
    return response.data;
  },
};
