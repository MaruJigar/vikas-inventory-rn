import { apiClient } from '@/api/client';
import type { AuthTokens, LoginPayload, User } from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
};
