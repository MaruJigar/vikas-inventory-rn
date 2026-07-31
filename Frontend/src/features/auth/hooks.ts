import { useMutation, useQuery } from '@tanstack/react-query';

import { authApi } from '@/features/auth/api';
import { useAuthStore } from '@/store/useAuthStore';
import type { RegisterDistributorForm } from '@/features/auth/schemas';
import type { LoginPayload } from '@/types/auth';

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

/**
 * Distributor self-signup.
 *
 * The endpoint returns no tokens, so we sign in with the credentials just
 * chosen — the backend's `login()` does NOT block PENDING_APPROVAL accounts, so
 * RootNavigator lands them on the waiting screen and they see approval progress
 * immediately. If that follow-up login fails the account still exists, so we
 * report success and let them sign in by hand.
 */
export function useRegisterDistributor() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (form: RegisterDistributorForm) => {
      await authApi.registerDistributor({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        business_name: form.business_name,
        // Send optional fields only when filled — the DTO rejects nothing here,
        // but empty strings would be stored verbatim.
        ...(form.gst_number ? { gst_number: form.gst_number } : {}),
        ...(form.city ? { city: form.city } : {}),
        manufacturer_id: form.manufacturer_ids[0],
        manufacturer_ids: form.manufacturer_ids,
      });

      try {
        const tokens = await authApi.login({
          email_or_phone: form.email,
          password: form.password,
        });
        await setTokens(tokens);
        setUser(await authApi.me());
        return { signedIn: true };
      } catch {
        return { signedIn: false };
      }
    },
  });
}

/** Request a password-reset email. Backend responds 200 regardless of whether
 * the email exists (anti-enumeration), so success just means "request sent". */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
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
