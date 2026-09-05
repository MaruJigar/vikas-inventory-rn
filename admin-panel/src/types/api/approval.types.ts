export interface ReviewApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}

export interface ApprovalDto {
  id: string;
  request_type: string;
  requester_user_id?: string;
  manufacturer_id?: string;
  distributor_id?: string;
  salesman_id?: string;
  status: string;
  submitted_at: string;
  reviewed_by_user_id?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
