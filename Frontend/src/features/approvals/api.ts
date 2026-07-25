import { apiClient } from '@/api/client';
import type { ListQuery, Paginated } from '@/api/types';
import type {
  ApprovalRequest,
  ApprovalDetail,
  ApprovalStatus,
  ReviewApprovalPayload,
} from '@/features/approvals/types';

export interface ApprovalListQuery extends ListQuery {
  /** Backend defaults to PENDING_APPROVAL when omitted. */
  status?: ApprovalStatus;
}

/** Approvals live under `/v1/approvals`, role-scoped: a distributor sees their
 * own pending SALESMAN_APPROVAL + SHOP_APPROVAL requests. */
export const approvalsApi = {
  list: (query: ApprovalListQuery) =>
    apiClient
      .get<Paginated<ApprovalRequest>>('/approvals/pending', { params: query })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApprovalDetail>(`/approvals/${id}`).then((r) => r.data),

  review: (id: string, payload: ReviewApprovalPayload) =>
    apiClient
      .post<unknown>(`/approvals/${id}/review`, payload)
      .then((r) => r.data),
};
