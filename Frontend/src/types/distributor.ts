/** Subset of the backend Distributor entity used by the app. */
export interface Distributor {
  id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  gst_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  approval_status: string;
}

/** PUT /v1/distributors/profile — all fields optional (city/state are free
 * text names on the backend, not region FKs). */
export interface UpdateDistributorProfilePayload {
  business_name?: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  gst_number?: string;
  address?: string;
  city?: string;
  state?: string;
}
