import { api } from '@/lib/api/axios';

export interface StateOption {
  id: string;
  name: string;
}

export interface CityOption {
  id: string;
  name: string;
  state_id: string;
}

export const regionService = {
  getStates: (): Promise<StateOption[]> =>
    api.get<StateOption[]>('/states').then((res) => res.data),

  getCities: (stateId: string): Promise<CityOption[]> =>
    api.get<CityOption[]>('/cities', { params: { state_id: stateId } }).then((res) => res.data),
};