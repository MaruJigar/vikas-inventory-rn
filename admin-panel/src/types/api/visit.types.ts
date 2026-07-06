export interface StartVisitDto {
  shopId: string;
  latitude?: number;
  longitude?: number;
  visitType?: string;
  isOfflineCreated?: boolean;
  idempotencyKey?: string;
  startedAt?: string;
}

export interface EndVisitDto {
  visitId: string;
  latitude?: number;
  longitude?: number;
  endedAt?: string;
}

export interface NoOrderVisitDto {
  visitId: string;
  reason: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  endedAt?: string;
}

export interface VisitDto {
  id: string;
  shop_id: string;
  distributor_id: string;
  salesman_id: string;
  status: string;
}
