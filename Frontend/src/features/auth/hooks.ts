import { useMutation, useQuery } from '@tanstack/react-query';

import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  LoginPayload,
  RegisterDistributorPayload,
} from '@/types/auth';

/**
 * Login: backend returns tokens only, so we persist them and then fetch
 * `/auth/me` to load the user (role + approval_status) for routing.
 */
export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokens = await authApi.login(payload);
      await setTokens(tokens);
      const user = await authApi.me();
      setUser(user);
      return user;
    },
  });
}

export function useRegisterDistributor() {
  return useMutation({
    mutationFn: (payload: RegisterDistributorPayload) =>
      authApi.registerDistributor(payload),
  });
}

/** Re-fetch the current user — used by the waiting screen's "refresh status". */
export function useMe(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    enabled,
  });
}
