import { apiClient } from '@/api/client';
import type {
  AuthTokens,
  LoginPayload,
  RegisterDistributorPayload,
  User,
} from '@/types/auth';

/** Registration endpoints return a pending-request acknowledgement, not tokens. */
export interface RegisterResponse {
  message: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  registerDistributor: (payload: RegisterDistributorPayload) =>
    apiClient
      .post<RegisterResponse>('/auth/register/distributor', payload)
      .then((r) => r.data),

  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
};
