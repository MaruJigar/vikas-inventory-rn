/** Working-day / attendance history (Backend/src/working-day). A salesman sees
 * their own days; a distributor sees all their salesmen's. */

export interface WorkingDay {
  id: string;
  salesman_id: string;
  salesman: { id: string; full_name: string } | null;
  distributor_id: string;
  check_in_at: string;
  check_out_at: string | null;
  /** ACTIVE while checked in; a terminal value once checked out. */
  status: string;
  created_at: string;
}
