import { api } from '@/lib/api/axios';
import { AuthDto } from '@/types/api/auth.types';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  login: (data: AuthDto) => api.post<LoginResponse>('/auth/login', data).then(res => res.data),
  refreshToken: () => api.post<LoginResponse>('/auth/refresh').then(res => res.data)
};
