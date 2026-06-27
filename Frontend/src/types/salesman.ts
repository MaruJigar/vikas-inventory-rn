/** Mirrors the backend Salesman entity (Backend/src/salesman). */
export interface Salesman {
  id: string;
  user_id: string;
  distributor_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  approval_status: string;
  is_active: boolean;
  created_at: string;
}

export type ApprovalStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';

/** POST /v1/salesmen (distributor creates a salesman; defaults to APPROVED). */
export interface CreateSalesmanPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  distributor_id: string;
  is_active: boolean;
}

/** PUT /v1/salesmen/:id */
export interface UpdateSalesmanPayload {
  full_name?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  approval_status?: ApprovalStatus;
}
