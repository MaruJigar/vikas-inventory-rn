import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api/common.types';
import { ApprovalDto, ReviewApprovalDto } from '@/types/api/approval.types';

export const approvalService = {
  getPendingRequests: () => api.get<PaginatedResponse<ApprovalDto>>('/approvals/pending').then(res => res.data),
  reviewRequest: (id: string, dto: ReviewApprovalDto) => api.post<ApiResponse<void>>(`/approvals/${id}/review`, dto).then(res => res.data),
};
