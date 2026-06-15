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
  status: string;
}
