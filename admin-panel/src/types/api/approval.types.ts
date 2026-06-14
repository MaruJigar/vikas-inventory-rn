export interface ReviewApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}

export interface ApprovalDto {
  id: string;
  type: string;
  status: string;
  created_at: string;
  manufacturer_id: string;
  distributor_id?: string;
  requested_by?: string;
}
