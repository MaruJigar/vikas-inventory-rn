import axios from 'axios';
import type { TFunction } from 'i18next';

/**
 * Maps an unknown error (axios or otherwise) to a translated, user-facing
 * message. The response interceptor already humanises network/timeout errors.
 */
export function getApiErrorMessage(error: unknown, t: TFunction): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const raw = Array.isArray(data?.message) ? data?.message[0] : data?.message;

    if (status === 401) {
      // A deactivated account also returns 401 — tell the user that instead of
      // wrongly claiming their password is invalid.
      if (raw && /deactiv|inactive|disabled/i.test(raw)) {
        return t('errors.accountDeactivated');
      }
      return t('errors.invalidCredentials');
    }

    if (raw) return raw;
    // Interceptor-set network/timeout message.
    if (error.message) return error.message;
  }
  return t('errors.generic');
}
