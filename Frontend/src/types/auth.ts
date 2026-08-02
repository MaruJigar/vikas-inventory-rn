/** Mirrors the backend user/role/approval contract (Backend/src/user, /auth). */

/** Role strings exactly as the backend stores/returns them (user.role). */
export type Role =
  | 'SUPER_ADMIN'
  | 'MANUFACTURER_ADMIN'
  | 'DISTRIBUTOR_ADMIN'
  | 'SALESMAN';

export type ApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: Role;
  approval_status: ApprovalStatus;
  is_active?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/** POST /v1/auth/login */
export interface LoginPayload {
  email_or_phone: string;
  password: string;
}

/**
 * POST /v1/auth/register/distributor (public — no token required).
 * Backend creates the user (role DISTRIBUTOR_ADMIN, approval_status
 * PENDING_APPROVAL), the `distributors` row, the manufacturer link and a
 * DISTRIBUTOR_APPROVAL request, all in one transaction.
 */
export interface RegisterDistributorPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  business_name: string;
  gst_number?: string;
  city?: string;
  /**
   * Every manufacturer the applicant selected. The backend creates one
   * `manufacturer_distributors` link AND one approval request per id, so each
   * manufacturer reviews the application independently.
   */
  manufacturer_ids: string[];
}

/** Registration returns NO tokens — the account starts pending approval. */
export interface RegisterDistributorResponse {
  message: string;
  userId: string;
}

