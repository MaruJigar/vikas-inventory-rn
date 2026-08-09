import { PaginatedResponse } from './common.types';
import { OrderDto } from './order.types';

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
  salesman_id: string;
  distributor_id: string;
  shop_id: string;
  working_day_id?: string;
  visit_type?: string;
  status: string;
  started_at: string;
  ended_at?: string;
  start_location?: {
    type: string;
    coordinates: number[];
  };
  end_location?: {
    type: string;
    coordinates: number[];
  };
  no_order_reason?: string;
  no_order_note?: string;
  is_offline_created: boolean;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;

  shop?: {
    id: string;
    name: string;
  };
  salesman?: {
    id: string;
    full_name: string;
  };
  orders?: OrderDto[];
}

export type VisitsResponse = PaginatedResponse<VisitDto>;
