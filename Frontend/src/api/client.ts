import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { useAuthStore } from '@/store/useAuthStore';
import type { AuthTokens } from '@/types/auth';

/**
 * Base URL includes the backend's URI version prefix (`/v1`).
 * Override per environment via EXPO_PUBLIC_API_URL, e.g.
 * http://192.168.1.10:3000/v1 for a physical device on the LAN.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/v1';

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
  console.warn(
    '⚠️ EXPO_PUBLIC_API_URL not set — defaulting to http://localhost:3000/v1. ' +
      'Physical devices cannot reach localhost; set your machine LAN IP.',
  );
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request: attach access token ---------------------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: friendly errors + 401 token refresh ----------------------
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach((p) =>
    error || !token ? p.reject(error) : p.resolve(token),
  );
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    // Network / timeout — give a readable message.
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      error.message = 'Connection timed out. Check your internet and retry.';
      return Promise.reject(error);
    }
    if (!error.response) {
      error.message = 'Network error. Cannot reach the server.';
      return Promise.reject(error);
    }

    // 401 → attempt a single refresh, queueing concurrent requests.
    if (error.response.status === 401 && original && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) {
        await logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );
        await setTokens(data);
        flushQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(original);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        await logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
