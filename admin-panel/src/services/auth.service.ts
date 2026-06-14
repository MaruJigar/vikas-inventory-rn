import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { AuthDto, UserDto } from '@/types/api/auth.types';

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
}

export const authService = {
  login: (data: AuthDto) => api.post<ApiResponse<LoginResponse>>('/auth/login', data).then(res => res.data),
  refreshToken: () => api.post<ApiResponse<LoginResponse>>('/auth/refresh').then(res => res.data)
};
