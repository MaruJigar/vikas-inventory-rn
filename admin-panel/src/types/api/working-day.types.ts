export interface CheckInDto {
  latitude: number;
  longitude: number;
  device_id?: string;
  idempotency_key?: string;
}

export interface CheckOutDto {
  latitude: number;
  longitude: number;
  device_id?: string;
  idempotency_key?: string;
}

export interface WorkingDayDto {
  id: string;
  salesman_id: string;
  distributor_id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_in_location: any | null;
  check_out_location: any | null;
  status: string;
  device_id: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
  salesman?: {
    id: string;
    full_name: string;
  };
  distributor?: {
    id: string;
    business_name: string;
  };
}

export interface WorkingDayQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}
