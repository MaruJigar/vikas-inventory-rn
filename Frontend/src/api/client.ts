import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import i18n from '@/i18n';
import { isDeviceOffline, notifyConnectivityIssue } from '@/lib/network';
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

/**
 * Auth-entry endpoints establish a session rather than consume one, so a 401
 * here means bad credentials — NOT an expired access token. They must bypass
 * the refresh machinery; otherwise a wrong-password login is misread as a
 * stale session (and, with no refresh token, can leave the request hanging).
 */
const isAuthEntryRequest = (url?: string): boolean =>
  !!url && /\/auth\/(login|register|refresh)/.test(url);

/**
 * Axios can't distinguish "this phone has no internet" from "the server is
 * unreachable" — both arrive without a response. NetInfo can, so prefer the
 * offline wording when the device itself is disconnected. Translated at call
 * time so it follows a runtime language switch.
 */
const connectivityMessage = (fallbackKey: string) =>
  isDeviceOffline() ? i18n.t('errors.offline') : i18n.t(fallbackKey);

/**
 * Connectivity failures toast from here, so EVERY call gets one without each
 * screen handling it. The throttle lives in lib/network so a connection drop
 * and the requests it kills share one cooldown.
 */
const raiseConnectivityToast = notifyConnectivityIssue;

/** No HTTP response at all: offline, DNS failure, server down, or a timeout. */
const isConnectivityError = (err: unknown) =>
  axios.isAxiosError(err) &&
  (!err.response ||
    err.code === 'ECONNABORTED' ||
    /timeout|Network Error/i.test(err.message));

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

    // Connectivity failure — toast it once, and attach a translated message for
    // screens that also render the error inline.
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      error.message = connectivityMessage('errors.timeout');
      raiseConnectivityToast(error.message);
      return Promise.reject(error);
    }
    if (!error.response) {
      error.message = connectivityMessage('errors.network');
      raiseConnectivityToast(error.message);
      return Promise.reject(error);
    }

    // 401 → attempt a single refresh, queueing concurrent requests.
    // Auth-entry 401s (bad credentials) skip refresh and reject directly.
    if (
      error.response.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEntryRequest(original.url)
    ) {
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
        // Reset before returning — this path skips the try/finally below.
        isRefreshing = false;
        flushQueue(error, null);
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
        // A refresh that failed for lack of connectivity says nothing about the
        // session — logging out here would sign the user out of a valid session
        // every time they hit a dead zone. Only a real server rejection ends it.
        if (isConnectivityError(refreshErr)) {
          const message = connectivityMessage('errors.network');
          raiseConnectivityToast(message);
          return Promise.reject(refreshErr);
        }
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
