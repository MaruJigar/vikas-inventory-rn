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
  /** Region (added backend `AddSalesmanRegion`): stored names + FK ids. */
  state_name?: string | null;
  city_name?: string | null;
  state_id?: string | null;
  city_id?: string | null;
  created_at: string;
}

/** POST /v1/salesmen (distributor creates a salesman; defaults to APPROVED).
 * `state_id` + `state` are REQUIRED by the backend; city is optional. */
export interface CreateSalesmanPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  distributor_id: string;
  state_id: string;
  state: string;
  city_id?: string;
  city?: string;
}

/** PUT /v1/salesmen/:id (all optional; region added by AddSalesmanRegion). */
export interface UpdateSalesmanPayload {
  full_name?: string;
  phone?: string;
  email?: string;
  state_id?: string;
  state?: string;
  city_id?: string;
  city?: string;
}

/** PATCH /v1/salesmen/:id/status */
export interface UpdateSalesmanStatusPayload {
  is_active: boolean;
}
