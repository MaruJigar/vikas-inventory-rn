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

