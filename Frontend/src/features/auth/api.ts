import { apiClient } from '@/api/client';
import type { AuthTokens, LoginPayload, User } from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  // Sends a password-reset link to the email (if an account exists). The
  // backend always returns the same generic message to prevent enumeration.
  forgotPassword: (email: string) =>
    apiClient
      .post<{ message: string }>('/auth/forgot-password', { email })
      .then((r) => r.data),
};
