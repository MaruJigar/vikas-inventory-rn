/** Subset of the backend Distributor entity used by the app. */
export interface Distributor {
  id: string;
  business_name: string;
  gst_number: string | null;
  city: string | null;
  state: string | null;
  approval_status: string;
}
