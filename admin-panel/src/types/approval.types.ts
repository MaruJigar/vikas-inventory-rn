export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type RequestType = 
  | 'SALESMAN_APPROVAL'
  | 'DISTRIBUTOR_APPROVAL'
  | 'MANUFACTURER_APPROVAL'
  | 'LINK_REQUEST';

export interface ApprovalRequestDto {
  id: string;
  request_type: RequestType;
  status: ApprovalStatus;

  requester_user_id: string | null;
  requester_name: string | null;

  salesman_id: string | null;
  salesman_name: string | null;

  distributor_id: string | null;
  distributor_name: string | null;

  manufacturer_id: string | null;
  manufacturer_name: string | null;

  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewApprovalDto {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}
