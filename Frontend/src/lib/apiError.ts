import axios from 'axios';
import type { TFunction } from 'i18next';

/**
 * Maps an unknown error (axios or otherwise) to a translated, user-facing
 * message. The response interceptor already humanises network/timeout errors.
 */
export function getApiErrorMessage(error: unknown, t: TFunction): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return t('errors.invalidCredentials');

    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    // Interceptor-set network/timeout message.
    if (error.message) return error.message;
  }
  return t('errors.generic');
}
