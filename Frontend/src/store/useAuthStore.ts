import { create } from 'zustand';

import { secureStorage, STORAGE_KEYS } from '@/lib/secureStorage';
import { useVisitStore } from '@/store/useVisitStore';
import type { AuthTokens, User } from '@/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  /** Load tokens from secure storage on app start. */
  hydrate: () => Promise<void>;
  /** Persist a fresh token pair (after login/refresh). */
  setTokens: (tokens: AuthTokens) => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  accessToken: null,
  refreshToken: null,
  user: null,

  hydrate: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.accessToken),
        secureStorage.get(STORAGE_KEYS.refreshToken),
      ]);
      set({
        accessToken,
        refreshToken,
        status: accessToken ? 'authenticated' : 'unauthenticated',
      });
    } catch (err) {
      // Never leave the app stuck on the loading spinner.
      if (__DEV__) console.warn('Auth hydrate failed:', err);
      set({ status: 'unauthenticated' });
    }
  },

  setTokens: async ({ access_token, refresh_token }) => {
    await Promise.all([
      secureStorage.set(STORAGE_KEYS.accessToken, access_token),
      secureStorage.set(STORAGE_KEYS.refreshToken, refresh_token),
    ]);
    set({
      accessToken: access_token,
      refreshToken: refresh_token,
      status: 'authenticated',
    });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await Promise.all([
      secureStorage.remove(STORAGE_KEYS.accessToken),
      secureStorage.remove(STORAGE_KEYS.refreshToken),
    ]);
    // Drop any in-progress check-in/visit so the next user starts clean.
    useVisitStore.getState().reset();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'unauthenticated',
    });
  },
}));
