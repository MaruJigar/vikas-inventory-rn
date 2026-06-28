/** Mirrors the backend WorkingDay / ShopVisit entities (Backend/src). */

export interface WorkingDay {
  id: string;
  salesman_id: string;
  check_in_at: string;
  check_out_at: string | null;
  status: string;
}

export interface ShopVisit {
  id: string;
  shop_id: string;
  working_day_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export interface CheckInPayload {
  latitude: number;
  longitude: number;
}

export interface StartVisitPayload {
  shopId: string;
  latitude?: number;
  longitude?: number;
}

export interface EndVisitPayload {
  visitId: string;
  latitude?: number;
  longitude?: number;
}

export interface NoOrderVisitPayload {
  visitId: string;
  reason: string;
  note?: string;
  latitude?: number;
  longitude?: number;
}
