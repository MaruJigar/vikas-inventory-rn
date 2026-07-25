/** Approval requests (Backend/src/approval). A distributor's inbox covers
 * pending SALESMAN_APPROVAL + SHOP_APPROVAL requests scoped to them. Routes live
 * under `/v1/approvals`. */

export type ApprovalRequestType =
  | 'SALESMAN_APPROVAL'
  | 'SHOP_APPROVAL'
  | 'DISTRIBUTOR_APPROVAL'
  | 'MANUFACTURER_APPROVAL';

export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  request_type: ApprovalRequestType | string;
  status: ApprovalStatus | string;
  requester_user_id: string | null;
  salesman_id: string | null;
  shop_id: string | null;
  distributor_id: string | null;
  manufacturer_id: string | null;
  rejection_reason: string | null;
  submitted_at?: string;
  reviewed_at?: string | null;
  created_at: string;
  /** Names resolved by the list endpoint (no extra fetch needed). */
  requester_name?: string | null;
  salesman_name?: string | null;
  shop_name?: string | null;
  distributor_name?: string | null;
  manufacturer_name?: string | null;
}

/** A row from the approval's audit trail (returned by GET /approvals/:id). */
export interface ApprovalLog {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  reason: string | null;
  acted_by_user_name?: string;
  created_at: string;
}

/** GET /approvals/:id response. `entity` is the underlying salesman/shop/etc. */
export interface ApprovalDetail {
  request: ApprovalRequest;
  logs: ApprovalLog[];
  entity: Record<string, unknown> | null;
  requester: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

/** POST /approvals/:id/review body. */
export interface ReviewApprovalPayload {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}
